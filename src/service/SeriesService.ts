import { logger } from '@modules/winston';

import IngredientDao from '@dao/IngredientDao';
import SeriesDao from '@dao/SeriesDao';
import NoteDao from '@dao/NoteDao';

import { PagingRequestDTO } from '@src/controllers/definitions/request/common';

import {
    PagingDTO,
    IngredientDTO,
    ListAndCountDTO,
    SeriesDTO,
    SeriesFilterDTO,
} from '@dto/index';

const LOG_TAG: string = '[Series/Service]';

const FILTER_INGREDIENT_LIMIT_USED_COUNT: number = 10;

class SeriesService {
    seriesDao: SeriesDao;
    ingredientDao: IngredientDao;
    noteDao: any;
    constructor(
        seriesDao?: SeriesDao,
        ingredientDao?: IngredientDao,
        noteDao?: any
    ) {
        this.seriesDao = seriesDao ?? new SeriesDao();
        this.ingredientDao = ingredientDao ?? new IngredientDao();
        this.noteDao = noteDao ?? new NoteDao();
    }

    /**
     * 특정 계열 조회
     *
     * @param {integer} seriesIdx
     * @returns {Promise<SeriesDTO>} seriesDTO
     **/
    getSeriesByIdx(seriesIdx: number): Promise<SeriesDTO> {
        logger.debug(`${LOG_TAG} getSeriesByIdx(seriesIdx = ${seriesIdx})`);
        return this.seriesDao.readByIdx(seriesIdx);
    }

    /**
     * 계열 전체 목록 조회
     *
     * @param {PagingRequestDTO} pagingRequestDTO
     * @returns {Promise<ListAndCountDTO<SeriesDTO>>} listAndCountDTO
     **/
    getSeriesAll(
        pagingRequestDTO: PagingRequestDTO
    ): Promise<ListAndCountDTO<SeriesDTO>> {
        logger.debug(
            `${LOG_TAG} getSeriesAll(pagingRequestDTO = ${pagingRequestDTO})`
        );
        return this.seriesDao.readAll(PagingDTO.create(pagingRequestDTO));
    }

    /**
     * 계열 검색
     *
     * @param {PagingRequestDTO} pagingRequestDTO
     * @returns {Promise<ListAndCountDTO<SeriesDTO>>} listAndCountDTO
     **/
    searchSeries(
        pagingRequestDTO: PagingRequestDTO
    ): Promise<ListAndCountDTO<SeriesDTO>> {
        logger.debug(
            `${LOG_TAG} searchSeries(pagingRequestDTO = ${pagingRequestDTO})`
        );
        return this.seriesDao.search(PagingDTO.create(pagingRequestDTO));
    }

    /**
     * 필터에서 보여주는 Series 조회
     *
     * @param {pagingDTO} pagingDTO
     * @returns {Promise<ListAndCountDTO<SeriesFilterDTO>>} listAndCountDTO
     */
    async getFilterSeries(
        pagingRequestDTO: PagingRequestDTO
    ): Promise<ListAndCountDTO<SeriesFilterDTO>> {
        logger.debug(
            `${LOG_TAG} getFilterSeries(pagingRequestDTO = ${pagingRequestDTO})`
        );
        const result: ListAndCountDTO<SeriesDTO> = await this.seriesDao.readAll(
            PagingDTO.create(pagingRequestDTO)
        );
        const seriesIdxList: number[] = result.rows.map(
            (it: SeriesDTO) => it.seriesIdx
        );
        const ingredientList: IngredientDTO[] =
            await this.ingredientDao.readBySeriesIdxList(seriesIdxList);
        const ingredientFilteredList: IngredientDTO[] =
            await this.filterByUsedCount(ingredientList);
        const ingredientMap: Map<number, IngredientDTO[]> =
            ingredientFilteredList.reduce(
                (
                    prev: Map<number, IngredientDTO[]>,
                    cur: IngredientDTO
                ): Map<number, IngredientDTO[]> => {
                    if (!prev.has(cur.seriesIdx)) {
                        prev.set(cur.seriesIdx, []);
                    }
                    prev.get(cur.seriesIdx)!!.push(cur);
                    return prev;
                },
                new Map<number, IngredientDTO[]>()
            );
        return new ListAndCountDTO<SeriesFilterDTO>(
            result.count,
            result.rows.map((it: SeriesDTO) => {
                return SeriesFilterDTO.createByJson(
                    Object.assign({}, it, {
                        ingredients: ingredientMap.get(it.seriesIdx) || [],
                    })
                );
            })
        );
    }

    /**
     * 계열 영어 이름으로 조회
     *
     * @param {string} englishName
     * @returns {Promise<SeriesDTO>}
     **/
    findSeriesByEnglishName(englishName: string): Promise<SeriesDTO> {
        logger.debug(
            `${LOG_TAG} findSeriesByEnglishName(englishName = ${englishName})`
        );
        return this.seriesDao.findSeries({ englishName });
    }

    private async filterByUsedCount(
        ingredientList: IngredientDTO[]
    ): Promise<IngredientDTO[]> {
        const ingredientIdxList: number[] = ingredientList.map(
            (it: IngredientDTO) => it.ingredientIdx
        );
        const countMap: Map<number, number> = (
            await this.noteDao.getIngredientCountList(ingredientIdxList)
        ).reduce(
            (
                prev: Map<number, number>,
                cur: { ingredientIdx: number; count: number }
            ): Map<number, number> => {
                prev.set(cur.ingredientIdx, cur.count);
                return prev;
            },
            new Map<number, number>()
        );
        return ingredientList.filter((it: IngredientDTO) => {
            return (
                (countMap.get(it.ingredientIdx) || 0) >
                FILTER_INGREDIENT_LIMIT_USED_COUNT
            );
        });
    }
}

export default SeriesService;
