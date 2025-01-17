import { expect } from 'chai';

import { SeriesFilterDTO } from '@dto/index';

import SeriesHelper from './SeriesMockHelper';

class SeriesFilterMockHelper {
    static validTest(this: SeriesFilterDTO) {
        expect(this.seriesIdx).to.be.ok;
        expect(this.englishName).to.be.ok;
        expect(this.name).to.be.ok;
        expect(this.imageUrl).to.be.ok;
        expect(this.description).to.be.not.undefined;
        expect(this.createdAt).to.be.ok;
        expect(this.updatedAt).to.be.ok;
        for (const ingredient of this.ingredientCategoryList) {
            expect(ingredient).instanceOf(String);
        }
    }
    static createWithIdx(seriesIdx: number, ingredientIdxList: number[]) {
        return SeriesFilterDTO.createByJson(
            Object.assign({}, SeriesHelper.createWithIdx(seriesIdx), {
                ingredientCategoryList: ingredientIdxList.map(
                    (ingredientIdx) => '카테고리' + ingredientIdx
                ),
            })
        );
    }
}

export default SeriesFilterMockHelper;
