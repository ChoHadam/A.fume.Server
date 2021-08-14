'use strict';

const Ingredient = require('../service/IngredientService');
const { OK } = require('../utils/statusCode.js');

const { IngredientConditionDTO } = require('../data/dto');

module.exports.postIngredient = (req, res, next) => {
    const { name, englishName, description, imageUrl, seriesIdx } =
        req.swagger.params['body'].value;
    Ingredient.postIngredient({
        name,
        englishName,
        description,
        imageUrl,
        seriesIdx,
    })
        .then((response) => {
            res.status(OK).json({
                message: 'ingredient post 성공',
                data: response,
            });
        })
        .catch((err) => next(err));
};

module.exports.getIngredient = (req, res, next) => {
    const ingredientIdx = req.swagger.params['ingredientIdx'].value;
    Ingredient.getIngredientByIdx(ingredientIdx)
        .then((response) => {
            res.status(OK).json({
                message: 'ingredient 개별 조회 성공',
                data: response,
            });
        })
        .catch((err) => next(err));
};

module.exports.getIngredientAll = (req, res, next) => {
    Ingredient.getIngredientAll()
        .then((response) => {
            res.status(OK).json({
                message: 'ingredient 전체  조회 성공',
                data: response,
            });
        })
        .catch((err) => next(err));
};

module.exports.searchIngredient = (req, res, next) => {
    let { pagingIndex, pagingSize, sort } = req.query;
    pagingIndex = parseInt(pagingIndex) || 1;
    pagingSize = parseInt(pagingSize) || 10;
    sort = sort || 'createdAt_desc';
    Ingredient.searchIngredient(pagingIndex, pagingSize, sort)
        .then((response) => {
            res.status(OK).json({
                message: '재료 검색 성공',
                data: response,
            });
        })
        .catch((err) => next(err));
};

module.exports.putIngredient = (req, res, next) => {
    const ingredientIdx = req.swagger.params['ingredientIdx'].value;
    const { name, englishName, description, imageUrl } =
        req.swagger.params['body'].value;
    Ingredient.putIngredient({
        ingredientIdx,
        name,
        englishName,
        description,
        imageUrl,
    })
        .then(() => {
            res.status(OK).json({
                message: 'ingredient put 성공',
            });
        })
        .catch((err) => next(err));
};

module.exports.patchIngredient = (req, res, next) => {
    const ingredientIdx = req.swagger.params['ingredientIdx'].value;
    const obj = req.swagger.params['body'].value;

    Ingredient.patchIngredient(ingredientIdx, obj)
        .then(() => {
            res.status(OK).json({
                message: 'ingredient 수정 성공',
            });
        })
        .catch((err) => next(err));
};

module.exports.deleteIngredient = (req, res, next) => {
    const ingredientIdx = req.swagger.params['ingredientIdx'].value;
    Ingredient.deleteIngredient(ingredientIdx)
        .then(() => {
            res.status(OK).json({
                message: 'ingredient 필터 조회 성공',
            });
        })
        .catch((err) => next(err));
};

module.exports.getIngredientByEnglishName = (req, res, next) => {
    Ingredient.findIngredient(new IngredientConditionDTO(req.body))
        .then((response) => {
            res.status(OK).json({
                message: '재료 조회 성공',
                data: response,
            });
        })
        .catch((err) => {
            next(err);
        });
};
