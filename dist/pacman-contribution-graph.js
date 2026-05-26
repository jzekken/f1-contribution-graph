/******/ var __webpack_modules__ = ({

/***/ "./src/bomberman/core/ai.ts"
/*!**********************************!*\
  !*** ./src/bomberman/core/ai.ts ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   movePlayer: () => (/* binding */ movePlayer),
/* harmony export */   shouldPlaceBomb: () => (/* binding */ shouldPlaceBomb)
/* harmony export */ });
/* harmony import */ var _rules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rules */ "./src/bomberman/core/rules.ts");
/* harmony import */ var _pathfinding__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pathfinding */ "./src/bomberman/core/pathfinding.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "./src/bomberman/core/constants.ts");



const findBestBombSpotTowardOpponent = (store, player, opponent) => {
    const currentRoute = (0,_pathfinding__WEBPACK_IMPORTED_MODULE_1__.estimateFastestRoute)(store, player, opponent);
    const candidates = [];
    const origins = (0,_pathfinding__WEBPACK_IMPORTED_MODULE_1__.findReachableBombOrigins)(store, player);
    for (const origin of origins) {
        if (!(0,_pathfinding__WEBPACK_IMPORTED_MODULE_1__.canEscapeAfterPlantingBombAt)(store, player, origin.position))
            continue;
        const contributions = (0,_rules__WEBPACK_IMPORTED_MODULE_0__.getBlastCells)(origin.position).filter((position) => (0,_rules__WEBPACK_IMPORTED_MODULE_0__.isContributionCell)(store, position));
        if (contributions.length === 0)
            continue;
        const openedCells = new Set(contributions.map(_rules__WEBPACK_IMPORTED_MODULE_0__.positionKey));
        const routeAfterBomb = (0,_pathfinding__WEBPACK_IMPORTED_MODULE_1__.estimateFastestRoute)(store, origin.position, opponent, openedCells);
        if (!routeAfterBomb)
            continue;
        const bestContribution = contributions.sort((a, b) => (0,_rules__WEBPACK_IMPORTED_MODULE_0__.manhattan)(a, opponent) - (0,_rules__WEBPACK_IMPORTED_MODULE_0__.manhattan)(b, opponent))[0];
        const routeImprovement = currentRoute ? currentRoute.cost - routeAfterBomb.cost : _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_PATH_BLAST_COST;
        if (routeImprovement <= 0)
            continue;
        const backtrackPenalty = origin.firstStep && (0,_pathfinding__WEBPACK_IMPORTED_MODULE_1__.isBacktrackingStep)(store, player, origin.firstStep) ? _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_AI_SCORE.BACKTRACK_PENALTY : 0;
        const score = routeAfterBomb.blastedCells * _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_PATH_BLAST_COST * _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_AI_SCORE.BLASTED_CELL_WEIGHT +
            origin.distance * _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_AI_SCORE.ORIGIN_DISTANCE_WEIGHT +
            routeAfterBomb.distance +
            (0,_rules__WEBPACK_IMPORTED_MODULE_0__.manhattan)(origin.position, opponent) * _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_AI_SCORE.OPPONENT_DISTANCE_WEIGHT +
            backtrackPenalty -
            contributions.length * _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_AI_SCORE.CONTRIBUTION_COUNT_REWARD -
            routeImprovement * _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_AI_SCORE.ROUTE_IMPROVEMENT_REWARD;
        candidates.push({
            position: origin.position,
            firstStep: origin.firstStep,
            contribution: bestContribution,
            score
        });
    }
    if (candidates.length === 0)
        return null;
    candidates.sort((a, b) => a.score - b.score || a.position.x - b.position.x || a.position.y - b.position.y);
    return candidates[0];
};
const shouldPlaceBomb = (store, player) => {
    if (!(0,_pathfinding__WEBPACK_IMPORTED_MODULE_1__.canEscapeAfterPlantingBomb)(store, player))
        return false;
    if ((0,_rules__WEBPACK_IMPORTED_MODULE_0__.bombWouldHitOpponent)(store, player))
        return true;
    const opponent = store.players.find((candidate) => candidate.id !== player.id && candidate.alive);
    if (!opponent)
        return false;
    const bombSpot = findBestBombSpotTowardOpponent(store, player, opponent);
    return Boolean(bombSpot && (0,_rules__WEBPACK_IMPORTED_MODULE_0__.samePosition)(bombSpot.position, player) && (0,_rules__WEBPACK_IMPORTED_MODULE_0__.bombWouldHitTarget)(store, player));
};
const movePlayer = (store, player) => {
    const escapeStep = (0,_pathfinding__WEBPACK_IMPORTED_MODULE_1__.findEscapeStep)(store, player);
    const mustEscape = Boolean((0,_rules__WEBPACK_IMPORTED_MODULE_0__.bombAt)(store, player)) || (0,_rules__WEBPACK_IMPORTED_MODULE_0__.isActiveExplosionCell)(store, player, player.id) || (0,_rules__WEBPACK_IMPORTED_MODULE_0__.isInOwnFutureBlast)(store, player, player);
    if (mustEscape) {
        if (escapeStep)
            movePlayerTo(player, escapeStep);
        return;
    }
    const opponent = store.players.find((candidate) => candidate.id !== player.id && candidate.alive);
    if (!opponent)
        return;
    const previousPosition = (0,_pathfinding__WEBPACK_IMPORTED_MODULE_1__.getPreviousPlayerPosition)(store, player.id);
    const directRoute = (0,_pathfinding__WEBPACK_IMPORTED_MODULE_1__.findPathToTarget)(store, player, (position) => (0,_rules__WEBPACK_IMPORTED_MODULE_0__.samePosition)(position, opponent), {
        avoidFirstStep: previousPosition,
        target: opponent
    });
    const safeDirectStep = (directRoute === null || directRoute === void 0 ? void 0 : directRoute.firstStep) &&
        (0,_rules__WEBPACK_IMPORTED_MODULE_0__.isPassableCell)(store, directRoute.firstStep) &&
        !(0,_rules__WEBPACK_IMPORTED_MODULE_0__.isActiveExplosionCell)(store, directRoute.firstStep, player.id) &&
        !(0,_rules__WEBPACK_IMPORTED_MODULE_0__.isInOwnFutureBlast)(store, player, directRoute.firstStep)
        ? directRoute.firstStep
        : null;
    if (safeDirectStep) {
        movePlayerTo(player, safeDirectStep);
        return;
    }
    const hasOwnActiveBomb = store.bombs.some((bomb) => !bomb.exploded && bomb.ownerId === player.id);
    if (hasOwnActiveBomb)
        return;
    const bombSpot = findBestBombSpotTowardOpponent(store, player, opponent);
    const next = bombSpot === null || bombSpot === void 0 ? void 0 : bombSpot.firstStep;
    if (!next || !(0,_rules__WEBPACK_IMPORTED_MODULE_0__.isPassableCell)(store, next) || (0,_rules__WEBPACK_IMPORTED_MODULE_0__.isActiveExplosionCell)(store, next, player.id) || (0,_rules__WEBPACK_IMPORTED_MODULE_0__.isInOwnFutureBlast)(store, player, next)) {
        return;
    }
    movePlayerTo(player, next);
};
const movePlayerTo = (player, next) => {
    var _a, _b;
    const direction = (_b = (_a = _rules__WEBPACK_IMPORTED_MODULE_0__.DIRECTIONS.find((delta) => player.x + delta.x === next.x && player.y + delta.y === next.y)) === null || _a === void 0 ? void 0 : _a.direction) !== null && _b !== void 0 ? _b : next.direction;
    if (direction)
        player.direction = direction;
    player.x = next.x;
    player.y = next.y;
};


/***/ },

/***/ "./src/bomberman/core/constants.ts"
/*!*****************************************!*\
  !*** ./src/bomberman/core/constants.ts ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BOMBERMAN_AI: () => (/* binding */ BOMBERMAN_AI),
/* harmony export */   BOMBERMAN_AI_SCORE: () => (/* binding */ BOMBERMAN_AI_SCORE),
/* harmony export */   BOMBERMAN_BLAST_RANGE: () => (/* binding */ BOMBERMAN_BLAST_RANGE),
/* harmony export */   BOMBERMAN_BOMB_FUSE_FRAMES: () => (/* binding */ BOMBERMAN_BOMB_FUSE_FRAMES),
/* harmony export */   BOMBERMAN_DEATH_ANIMATION_FRAMES: () => (/* binding */ BOMBERMAN_DEATH_ANIMATION_FRAMES),
/* harmony export */   BOMBERMAN_EXPLOSION_DURATION_FRAMES: () => (/* binding */ BOMBERMAN_EXPLOSION_DURATION_FRAMES),
/* harmony export */   BOMBERMAN_EXPLOSION_SPRITES: () => (/* binding */ BOMBERMAN_EXPLOSION_SPRITES),
/* harmony export */   BOMBERMAN_MAX_FRAMES: () => (/* binding */ BOMBERMAN_MAX_FRAMES),
/* harmony export */   BOMBERMAN_PATH_BLAST_COST: () => (/* binding */ BOMBERMAN_PATH_BLAST_COST),
/* harmony export */   BOMBERMAN_PLAYER_SPRITES: () => (/* binding */ BOMBERMAN_PLAYER_SPRITES),
/* harmony export */   BOMBERMAN_SPRITE_SETS: () => (/* binding */ BOMBERMAN_SPRITE_SETS),
/* harmony export */   BOMBERMAN_SVG: () => (/* binding */ BOMBERMAN_SVG),
/* harmony export */   CELL_SIZE: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE),
/* harmony export */   DELTA_TIME: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.DELTA_TIME),
/* harmony export */   GAP_SIZE: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE),
/* harmony export */   GRID_HEIGHT: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT),
/* harmony export */   GRID_WIDTH: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH),
/* harmony export */   PLUNDER_BOMBER_SPRITES: () => (/* binding */ PLUNDER_BOMBER_SPRITES)
/* harmony export */ });
/* harmony import */ var _shared_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/constants */ "./src/shared/constants.ts");
/* ─── Re-export shared constants so bomberman code has one import location ─── */

const BOMBERMAN_BOMB_FUSE_FRAMES = 8;
const BOMBERMAN_EXPLOSION_DURATION_FRAMES = 4;
const BOMBERMAN_MAX_FRAMES = 1200;
const BOMBERMAN_BLAST_RANGE = 1;
const BOMBERMAN_SVG = {
    PRECISION: 4,
    HEADER_HEIGHT: 15,
    MONTH_LABEL_Y: 10,
    MONTH_LABEL_FONT_SIZE: 10,
    CELL_RADIUS: 3,
    PLAYER_SPRITE_WIDTH: 22,
    PLAYER_SPRITE_HEIGHT: 28,
    PLAYER_SPRITE_FRAME_INTERVAL: 2,
    BOMB_PULSE_DURATION_MS: 500,
    BOMB_X: -8,
    BOMB_Y: -9,
    BOMB_WIDTH: 16,
    BOMB_HEIGHT: 18,
    BOMB_PULSE_SCALE: 1.1,
    EXPLOSION_SPRITE_CELL_SPAN: 3,
    EXPLOSION_SPRITE_GAP_SPAN: 2,
    EXPLOSION_OPACITY: 0.9,
    MIN_DURATION_MS: 1000,
    DURATION_SPEED_DIVISOR: 2
};
const BOMBERMAN_DEATH_ANIMATION_FRAMES = 8;
const BOMBERMAN_PATH_BLAST_COST = BOMBERMAN_BOMB_FUSE_FRAMES + 2;
const BOMBERMAN_AI = {
    ESCAPE_MIN_SEARCH_DEPTH: 4
};
const BOMBERMAN_AI_SCORE = {
    BLASTED_CELL_WEIGHT: 3,
    ORIGIN_DISTANCE_WEIGHT: 2,
    OPPONENT_DISTANCE_WEIGHT: 0.1,
    CONTRIBUTION_COUNT_REWARD: 0.25,
    ROUTE_IMPROVEMENT_REWARD: 0.5,
    BACKTRACK_PENALTY: 6
};
/* ───────────── Bomberman player sprites ───────────── */
const BOMBERMAN_PLAYER_SPRITES = {
    idleDown: {
        x: 305,
        y: 5,
        width: 16,
        height: 21,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAVCAYAAABPPm7SAAABgklEQVR42o1UIW/CQBh91yAmJ7v+g5OcY8kMsssExUFCliCxzTKBRCykFjWGIEECgjCBaEKWtO6Q9w/YSZKZuU5AL71y7folJ+679959330vR2CIuk0TU/4gBUFZ1G2a1G2aTHfLJPn51tZ0t0zS80Jyh22viPnVYVtNxErJ1Amw2DP8F4s9A3UC1aaVHjTfflE1stha/lA+eKVk+2ul7Wt5sv1+B/YkwDdUA6Y5+eABYx/aGwDApDes3EIWqwSoE1QWyGJJdoyD+QiPL+VC27GPSW+oTEXyXqBOoF6537gHAHzEEQAgfL2BOPqaI0kVC5dZ2sqS+YZiMB+pPrvtCN12pHoezEfgGwqjE3nLA2YU/TUvvLm/5sCMgrc8JaJ8IOMQdqMJGYcAAHH0sXg+e4EthRGjteDKE2QcwpWnwgpMGKLKB8DWK23O7DIFfpmCOJ4dmMVb2Rs+7VsdGEdX5BSjVZBPFrVhwtUOUhAX1yL57yvvEVeecJCCEBOg6O8zYf4AxGvpYTg/OGAAAAAASUVORK5CYII='
    },
    walkDown0: {
        x: 9,
        y: 8,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABiUlEQVR42p1Uv2vCQBT+LmTo2PGa/+CNuS2CFBxbHIybAZeOrqFTR4ci6dipKkVwtIvYwaFQCrol4/0HNpuFLm7XQS8mMU2tDw7C996X9+N7dww5szkpFFgUS1aEw+akbE6qP58o9f2ZOf35RGn/AaklZgeE/GmJWUJmNidFVoDxu8Ax5l2GkCsfBgDU7jc41nSsmQbjqltK4h8vybeZJvGnC4i6RDilDEFjcdUFej4AbEs9xU4mMi1HZ9TF9W1QGjzr+Xhs3yGKJWNpLTujbilRk5KMZav22+pletTTJCuA11zAay5AVpDxZeSwOalwShisPZB1BuFU9lI4FWAZYLDeIJyOIepQUSyZme8BAORkn0HU5RZrAzeprIbNSYUNFxjS3w0OCWHDhc1JmXkfWQGEU8HD826pm0C4XECu/GIdi8hAMSmjY3pIuq/0tEVdZl4BI6/jYO0dtKaxdGVJqa/8HNypbW/K8g1X8RcAoAiPYskM/RftLL2Puxibk2L/WbfS4RyzpwDwA3eo2etvVgkzAAAAAElFTkSuQmCC'
    },
    walkDown1: {
        x: 75,
        y: 8,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABkElEQVR42p2UsUvDQBTGf1c6OHY88x/cmGwVRHBUOthuDbg4ugZxcHSQEsdOtiKCY3Uo7eAgiNBuccx/ULNVcHE7h/bSXBrb6oOD8N378t5977sT5MKVSlMQ70ksinBcqbQrle4897T++rBW57mnzf4SqekNlgj51fQGKVm4UmnlhDy8emwS/l5EPAkoAexffbNpmNxyFkx26ytJ8u0x/S5nSfJmG68WE/WVRTBYsluHVgAwa/U/UQJ4Od/amGByhRnH6f0lh2fhStKgFdA+vuA9iYXIzlI5YaraSXUHgO54lFaKJ0HqILHOar9ZzxLHqKmcEL8xwm+MUE5o7VniuFLpqK/oTn2UE+LN2wTwqjszbD4S05llgPbxBQBxb1HBq8XF43Cl0kNZgVu1/oC3iuiojiuVLuf3TKvXd3NTNyAaj4gngZUnihQ1gpjIk6w5ZkXKn8tg2VeglJ9jd+ovHa0IS1sdygqyuj+7KeMXDpJPALK49/S4aNVUio7su2iShrJi4eaH4i92WynOJj4F+AFlodcPvNujWwAAAABJRU5ErkJggg=='
    },
    walkDown2: {
        x: 108,
        y: 8,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABf0lEQVR42qVUMU8CMRT+ShgcGev9g47X7UiICSPEgWPjEjf/wcU4ODoYU0Ymwbg4IgOBgYHE5diOsf8Au0Hi4mQdzh70OOHUlzRpXt/X9/q9rw/IMZcy7VKmccBIHigvcKkkwaEs/dlQ6/c3a/VnQ51bhUuZ7vDJHiC7OnySgolLmWaOwPMrRxELzmLIVYgSANTvPlDUTGwJf7Ry1qFq/mHEfbgPVDUf9OEU/FwiHjMr3vialwI9U+r8+uTXpZaWShK5CjFYRIUADbXBUklCdnvJHIHu5+1RkCW5Y9rMSs9qhyGEOQJBO0LQjsAcYZ2lbzTZ4jHDYB2AOQLcq27Z9KqJ75tVU1najsE6QO/iBgAgh9sM/FwmGVs+8AgA0lZO80r8Tznmjd2npNygDcSLCHwUWuRYrMatRG589JKSAgByFe6xWjagKa2kh1NaQWMnOG75UIs5GmpjswoA1Ksjb28upF4dU1qB9ZFNgAFkb/9xWO2CjbSOqYcUmXB5k+4LCXHPPa24MKoAAAAASUVORK5CYII='
    },
    walkDown3: {
        x: 141,
        y: 8,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABeklEQVR42p1UIU/DQBh910wgK4/9g5Ot2xKyZHJkYpujCYagsBUIfgCiyCk2gpksCELFRJOZ1bXy/kF3jiUY3E2UK72228q+5NLm+r1+73vfuwNKYVEmLcokjoRRBgXUREBNHAOTMnBfYiI4qf2gKM6WvpTfG23Nlr6sbcGiTF7ZnxVAeXl3XzmYWJRJ1vawWNloEk4vBk/dTJz+4w+ahso1cGKcDGzVbYqL8V7AJYCpAob3Z7hZ/YHo8znsIUf8wTSQPeQIqJlRTQQnPHUxj9aNKA7EFongxFCumF4/wOnFWdXbjZ79wvI95aDGlitbzyiCVE+s7cGZrOFMMvoBNRGPxpr5jXLzAGB3uloV2ulrz8o44lE2Btvv5ooufEBEIWinDxGFugHUOVQRUDOvrpS0398wENuqc4o01PvT6xzOZA3W9iritA4pGP/OlqcuAmpqFQ8Ceerm1IvqJ4ITouQNqJlTFFGo/b32dCjOxcRjoERw8i/nFC+sHSx90I3EuUDEAAAAAElFTkSuQmCC'
    },
    walkRight0: {
        x: 8,
        y: 41,
        width: 16,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAYAAADzoH0MAAABZ0lEQVR42p2UPU8CMRyHnxIHRsdy36Cb53YkLIw4CZskxoTBOOtAoh/A4VYmwM2RyejAwAgbN943gG6SuLjVRbB3XMvhL2ly7eX//rSCAoVSmaLzRKcifyZsg0SnIpTKqCCm+fwNQC+qAzBezBlcP+07CqUy5u7RrM8iE0plrs7fzWg6MeZrXbhG04mxM6wA6MWMlt5gR3apF9VRQbzLupLoVLT0BmAvbZfsICd27T4j3Wjvvi+AgV3CIelGGzms0dIb5LCGHNbA52C8mFNWGQezfpVjJfIAFTGQ7wFAS29IdCqEi0LXSGf9KunqYQeTcKXmm4pNoncKKogBWL4pALqdub+JZdTtzNlD2aV09ZDZv07q3N/0/pHBi2J52T7MgasHmRJue24ODk1CBXFmhKVK2E5g25P8q1RxRd5GH392vVkJ388PeYqMmn84/z48NlAVH3m2cdE+lMqIsvi6kBbH3oP8XfgBu12xmgbSwmIAAAAASUVORK5CYII='
    },
    walkRight1: {
        x: 74,
        y: 41,
        width: 16,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAYAAADzoH0MAAABdklEQVR42p1UIW/CQBh9RyaQyGv/wbm1riQYZJcJihvJsqRqegiS7QdM1KKAuUk2QYZAIIuj8v4BnGwyM3cTW7truWvLXtKkvfS+733vvTsCDRzKpG49EZyU14i6IRGcOJRJZkfoP38BAEKvCwBY7GJMb59OCzmUSXn/KI+XnnQokzfuh5xvllJ+HrXPfLOUKsMWAIjdFr5IoXY2IfS6YHaUs24lghNfpABwQtsEtcmFOnvVJtEL8vcrAFN1hDqIXgA6s+CLFHRmgc4soKrAYhejKQoFtpM2zgUpB0iXgbIGAOCLFInghJhSaLJ0O2mDH8Z5mIiJWpUrahIrXWB2BADYrxgAYDSMq0VsgtEwxkmUTeCHceH7ddnFw134DwYvDPtBUJ8DnQbMjuC+v/1oMQjgXnNzDuqcYHZUsLDRCJkDOk2MDLLO+xUrUF7TTiGF2iirP1Ov/xfl30tnTTvI7o9ClMvz6lTPxKw8TOeESnuYmhRSXfgGrX26OKISwJ0AAAAASUVORK5CYII='
    },
    walkRight2: {
        x: 108,
        y: 42,
        width: 15,
        height: 23,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAXCAYAAADUUxW8AAABgElEQVR42qVULW/DMBB9jgoGC93+A7MlLJVKClsFNHBgpOovWDQN9AcMlA5MbcYG24JqBQWFDUug/0FiGGlkzAOZXTcfSqU9yVLs0927e/cUAgA2ZRIAEsGJ+i4jEZyU34hNmYynPkR0wljkYP0lRq8/AICZOwAAhNEZb4+LahGbMpndu9KmTD44X3J93Ej5ndWe9XEjzc6sRHBSZmzCzB2A9Zd6TEsFyq02wSSwcCPC6Awx9DF5Xuq3TluSGPoAgAkAuuoVj17eziyGPuiqh7HIL4kGdPLp5U63dysstTueBrpAYyfzDGKeXUxiBtUKzLWZAj1ZC/A00EapWK7JnnU2tZqCrF8wxnsG814rWBOz43HEe4bP97ASr8x8oF2MRV7bcjwtdu7stkgEJzc7rA6NgqkZnT+vx9EZPA2utOnUJRYihXA8DkRFEZ4GONAuAOixOuV5lQ0dj+skADrRxBUzdUfAhxKH6b+LCfNOyvIrRfWqdtt2wdqcVWemf9nzF67Fws06Dc9qAAAAAElFTkSuQmCC'
    },
    walkRight3: {
        x: 142,
        y: 42,
        width: 15,
        height: 23,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAXCAYAAADUUxW8AAABf0lEQVR42pWUr27CUBjFf20qkJMX3uDK1kEyg2RBgBzJDCE8wCoQyAlEJ6dgjwATyyYQldSBvG8AV5LMTO1OsHb9u3QnadJ70/Pdc77v9ALgCmlcIQ3/hOUKafaDIToK6elz5YcHraz8ngMkRNkK6C4+ARi3OwA8RzsAnu7mpqwArpDm1nszq+3amI9T6bPargvWbFdIkz6xCuN2B9kKSBewgYLUKjx+PWTWdt3O6uthoaFOHRKAWDahX5OcIVXABghnjQJRLJsFme/iKks+aGWpo084ayQzLVUyOdHT50xYnN/0+IZZAIsdNzkSwL09B/xsPPNhAZCtIBlLWWTj0608MY39q0zevb5iP7g00XvZcNDKcmJi3Iw44+ro4/XVn2MsHZU6+pSp8PqbIvmgldWj3v+cKEQap8qvbAV4P1nfRztGUwrddmK/ot1FR2GSqNH0QkpbyYck41m0u+hJfKP4ldLjsNjxQkdhUiB/QpqUnrtV5fkvFEJSp0j+DvsGRtzJVsVjbugAAAAASUVORK5CYII='
    },
    walkRight4: {
        x: 207,
        y: 42,
        width: 15,
        height: 23,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAXCAYAAADUUxW8AAABgklEQVR42qVUIW/CQBh9RyqQkwf/4BytK8myZLJLBSBJZpapySEQk4gJJhELdGLJJJsgmUBUtq6V9w/gZJOZqd1E28u1HAS2lzS5fs37vnfveykBAJsyCQCp4KQ815EKTuo1YlMmk14fIg7hiQysPcXl4zcA4MbtAgCCOMLs+mG3iU2Z3HZcue240qZMLtZLKb+2xmexXkpdGdFl371OKhNNGF4k4JsRUsFJoyyy9vQgUZz3EcSRuhIAWOVBL5qIdN7C1W0+YFbUGzgBnshA5y31vkMO4ujoZoocjps4FURfmWnH+r11+angpJKacmV6Ex3huKnWVJlcb7APesIahz4mK4ZkxfJwDKL9htVRkhyfqwANBxFsylREjbKTXm6O8/G+09DxuVLYwB9wlGGsPYXjdpEUweGbUYVsmTp/0jMAwD2AJI7w9hzA8bmqe2AyFZxYh+Q9/UzgiQyOXxj4kpuIwgvLJNcTmZqilBREEYcw/gz2rq1wv/xVGbN9quP/iucv403HnBp4/m8AAAAASUVORK5CYII='
    },
    walkRight5: {
        x: 241,
        y: 42,
        width: 15,
        height: 23,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAXCAYAAADUUxW8AAABeUlEQVR42qWUr2/CQBTHPyUIJPLGf3CyOEhmkKBgcglmQc02C2JyghDsxDIwS5AFsWwCUbOEuk72P4BKkhncTZTrrqX8yl5ySXPX9973vt/vPQBsIZUtpOLCsGwhVdDuEPkezWhz8MfvKLSye0WAyPeSDVkZ0RhsuavVAZj4S7x+CXBUXoEE9njhqvHCVepnvbfGC3fvagX9cf/2BJB0zAtZGWEWKNpCKlkZAduDSdF1hxbA0CHsZjo3BtuTzIrXK1oPI3JhnxNZNQr8IwoAz93HZGPiL/chf82Ieuv9ZK1drOVfgWyRj6HDpyinHWZqbZokG16/RLhyUo6zsmY5dU/dvRlt8gkL3mWyAG5vlvkPw+watDsAVOezlKuqO9dN3XoKdvEUzHDlELoxmqmbfmGpZLPjsbCFVCnCbCGVSYYJN9jJFq6cFGFHYeuk6cskfiC9MqLWiA/ns5gwUyKzclYinainjnXu7NJK6MTkzpcOP832RQ7LzrBfnle9zbyp77EAAAAASUVORK5CYII='
    },
    walkUp0: {
        x: 9,
        y: 74,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABj0lEQVR42sWUoU/DQBTGf7dMTCIv/Q9Otm7ISZKJDceSmSmCRSwBiUDU4iiCBDm1gEBUtq6TJ/CsbiQzcw8BV67dYKD41PW9e+++970vVTQQaiPswKK0yv9u+QWhNnJ2fwVAMRhSDIYAnN1fVfmtV26fZyLrpch6KaE2IqcXIqcXH+fP+O3z7Ks41EZOoscq6V9oNpT1Uk6iRwm1kTZA73pTYzDpHjJ5SXeNSu96gx17M/4V/1SYTjskebb3cpJnpNMOAMop6/bnxGkWONyML1mUVil/lyaItxR2SKcd7Ot55SC1z2rfWa8mTjE3AJggZnScMTrOMEFcyzm03WvF3JCsRpigQ+TNGHUPIY9JVhuK+QNRH1mUVrX9LjfjSwDsbJuiHcPEe7UVaiPFYAh3Zv+Ad4ZiMKTyqg8TxDWqAEWeYV/PazG1S1EnSEWzUVTboy9S1Lc01Y76tvYXaDX3mKxG21b7jPnMKqpP+gDd7QFQ5ilH5RsAu+KL0qqW6+KSvzmH2oj6i91+FOc3PgV4B9TS3qWPX7w1AAAAAElFTkSuQmCC'
    },
    walkUp1: {
        x: 75,
        y: 74,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABgklEQVR42qWUr2/CQBzFP0cQSOSF/+Bk60AilyAARxMMEotATCIQ2DlA4NkEAYGoLO6QJ/AMtyUzuJvY2l1bNiD7JhX9/uh7976vJ8iEJ5XlQuxPRrjvBXfAk8r2FyMAdLOFbrYA6C9GST016Ellg3aEPoT0qrUcWq9aQx9Cgnb0w8iTynb8tbUfr8kz3S5tjDDdLlO1jr+2nlS2CFAfn3MIvUN46ajUx2dM1znjvfH/wdkuutrs9hQBwmGJ+vicFLLKugPhsASAiJWN93ctnrqP7E9GCNcAqjLJKewimeMgcZC4ZrXfrJdSVa8UAKoyIWhHBO0IVZmkajnL6ZXCbxhUZYLviONXa1+5hkGvVMKsmKVijgPM8oY9elLZjSzDXF3vnit0s0XiVTeyVAH0LsIcB6mcuKRoLIhLP6usyP79sUhZtf2GSd0CheweZ29B3qMXcgnVjSwjq3UATruQh9M7AG7ef3n+oRojxfdLsr/vpo0sp/LxB8U9dvtTnFt8CvAJx6DEoCOKVjcAAAAASUVORK5CYII='
    },
    walkUp2: {
        x: 108,
        y: 74,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABeUlEQVR42qVULW/DMBS8TAGFhVb+gWHMUjIpsNJAW9ZKJVPRaEBB4UBBaNlKJg12A1ULBiKNJMyFBuNJ4KSSMg9MTu3E/dh2KLLfPd87nwNY4BMqfUIlzsCxkXivDwBgb6/V+q4URq2rE2yd+WeCZZZiMZ7JRgOfUDlkGyn3hZT7QiqpT++rak3uCzlkm2oExydUUi/GywerGi2zFABwH3QaCka3HCKPfqSG84OxaSMohPMDxBi4wR/xf6Ka6xz0GhcAkmkL4fxw0hSdkExbxwD4hMqH58erJC7GM+xK4Tj6XVIvbjisnyTyqAqAcyk5dSii4SpfUwAA9WKMBilGgxTUi409w1WfUMnXFOxOgHoxmGYOCzoGWSlz61JEHkGsmhLLSdt+j+Wk+FUArObU5fIshcgjwxxD6vEBR0AWG/LrcNVpW3KcYUva6GrFvNdHmSXoll/NGUkQwvatGpIgxJa0YTxkVaAI9e4nzdHJAC6SjKxeEzv9R/UNBfy0USHon8MAAAAASUVORK5CYII='
    },
    walkUp3: {
        x: 141,
        y: 74,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABTklEQVR42r2Ur27DMBDGP0cDgYFW3sAwZR2ZVFhpoB0snIZKA/IAAwV5hIxMGgyqFBAQaSRlDvQbpGarVDLmgcyRnT9NNLBPOsWK75c7350DdBRQpgLKFCbkdCG+2YJvtpiC725tmnAlBRl1Mi3JU6WuZ6WuZ5XkqRo8gumY5KkFmRbvv1qYBJQp5sf4+FxgjnYPHKIOm+KsDt+YK+3r4I/6H/DtVNp9LCIXOJR4Xt5PAkXkAgCIbsf+/XUyYhG5EHWISgpCzF4yPx6ssAbMCSJjIzYmDTrWgB8ZAID5MXZPZWsAoPcGq7p4FM1zpEj8yNqsrNvBN9sGTPugfDn3IwaUqYx67UtzrbWWF6zlpZ8qXa7QXeszMj/uFefmRea/jRd1iIx6VsSboO6dmXpAmaqkIERXKaNem6I8FdbXB4dc52w6TkHWyM2ZHPOH9QOrJroE5w6VZAAAAABJRU5ErkJggg=='
    },
    death0: {
        x: 206,
        y: 202,
        width: 16,
        height: 21,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAVCAYAAABPPm7SAAABgElEQVR42pWUoW/CQBTGvyMVk8gb/8HJ1ixgliBLEBuSZG4KS8jEJGJZaqfGDAkSEGQIRJOZNjOtvP+AnSSZmTsEveNKr4W9pObye6/93vf1gIpyKZMuZbKKIWWNALCmdQCAL3YAgFTwAu/YGgfTMQCANlsAgEEcAQDeHp5l2SC4lMnJZi7l70/lM9nMc7KIamaNALMvD5dU/zYB3w6RCk5q6rD98odLy2RzO/iII3RGQWXz5+uwfImdUQD6fg2vy5GsWA5UZ53HIDdESwifri6WYLLO0ZahROb7uVILLATJpUyuzwzxxS6XA8cG/Kdq5tuTFdMpZI0A/V6Efi8CaxycGUzHSFYM1iAld/fHoHy34GUxVpXEEWY30dGV5QKp4ERLEHEI2mxDxCG4WIDPoa30ujxj6prJSUgFJ77YQcRh5Q5MRrtgfr63XGj9ALSMJPsb+fYQIJOvmW9QFmowjgrNpzYTm/dlMmyckwpOfBSHnF4ap1eb2gOxAdYbp4TZA9mI4jenPoeaAAAAAElFTkSuQmCC'
    },
    death1: {
        x: 8,
        y: 206,
        width: 16,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAYAAADzoH0MAAABVElEQVR42qVUMW7CMBR9RhyA8ZcbeEy2VOrCGIkBDtALsGbsyJi1U5nYgQGJgYGlEtnC6BukHiP1AO5kk3w7Lmq/FMX5/u/5++XZAoFISJpQ/qaVQCwSkiYhaTbnnTHfX71nc94ZOz8IDgGHiP4EDpGM8M8Y84R+WUYB9LnvfY84ONct6OPJvbvjXLfeAt4W6qNEOleojzKaGySwhelcRXM2BDfOiSZRDXLd9owlEpLmRBNQNoOuLsh1i9V2HQS/v76B14qEpKkXd2HSwz7aAa8dA4CuLo4VAOS0RJo994HVFaopvFpPAzktoZrCqW9F5HNOg9gJ5AShk+kRhNrn2+gSeD5QTYG6ukbBQR9wdbudWDCvuWkl3GGyqlI2c52gKu9jVjdoZRur7RqqKaCaYtBYnojWxpTNPEPVi6VbPddtX8TBe+6X+zP4Gx8NzwePEvGr/QduTytbQVkpAwAAAABJRU5ErkJggg=='
    },
    death2: {
        x: 41,
        y: 206,
        width: 16,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAYAAADzoH0MAAABeUlEQVR42qVUsW7CMBB9sfiAjFf+wBvJlkpdGCN1gJF+BhkZGeELyi8AA8IDA0sH1CWM+QPwGKk77kDt2sEOqD0psuO79+w7P18EjyXElW/9KKsIbZYQVwlxtdgtlfo6O99it1TaHwT7gCGiP4F9JJ3mSeTLsDVN+lg5/6wJzmUNen8yoz3PZX2zAWvuUG440tcK5Ya3rgUJbIC2EBgAoua9C4pba5DL2tFFlBBXgmJQ1oc87J0AnzVjOwBAWR9mXF+rzLszB1idCvhiGQDIw/6a63oF3p1BUIzqVGB+mWJ+maI6FRAUg3dnSH820BhHwqN0q869zIjElm5CXJ17mRqlW7+kNUFQ64EYhn8a81XZdwp9W3cJcll73/1RVpHvim+EVA6GptKaSPttn/azpgLfPp+dVOyj2z5vCuVgaAQzZhMIiiEoxphNjJjKgfsanX4gD3sTkK4L5MbzC3QEZBPksoag+CbAJvc9qOheJw6ZLnD0aEsPtfZvVKwyTDYVt1sAAAAASUVORK5CYII='
    },
    death3: {
        x: 74,
        y: 206,
        width: 16,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAYAAADzoH0MAAABpklEQVR42o1UoW7DMBB9jvYBgV7+wGwJmVqpZDBSQTu2SiODgy0sLEzh0DoyqbAJqBZQUDKp0UgL8wetYaTxZmA6106cbJaiWHfvznfP78xgWT4Xpc1+kDlD2/K5KH0uysVmVZbfJ+NbbFYl+RuDbYFNiSiOUfDz+wxPnS5kb9haJf+M8Zbt8PI4xUHmzNGdsjdEKAvw12v11/ehLGoHONUT9muBoJ9jvxattsYEBAz6eautxgEZUu62chDKwrhW5nNRptwF79xBZluEssDofoflqmsEkq2KZT4X5X5wISZIYgCA8CIjQX6c/PJRwToAILOtMggvUm3MzzPMzzPVmvAidQDFGBwILzJOIrC+1zFK2iTR001HqUwnVrcRhmyqAup5ebtDkMS1wSGuRl9dxUlNiflxYg2mcoMkVuVbhUQE2iaOrrt6OwbgIfhoHtcGTE2JOuPUCvl1H/mdqoSJJGqFSq/6rBzsB0NF0tiZIuUuUu5i7EwVyboSAeDKeA+yrQIEyQSh8lwCSYG1BKEskHK3BtCT2yaS/fUSNy0imP33SW962n8AdCQ0/3wR/FEAAAAASUVORK5CYII='
    },
    death4: {
        x: 106,
        y: 206,
        width: 18,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAABYklEQVR42p1VrW7DMBA++wkCrb6BWRyWV8g0MliwFxhsNBRYNHVwrGi8qEpAX2FSA/0GtWGk8d3QWefKzZ+lKInj73zffd85Ah4MozSm5ntvBcwZRmk0SuPxckL8ddF1vJyQvt/jxH2Qt+89PL0fRjdrP2r4em3S2VEWLi/RKI348xLu/NkojS4vQ3aEl6kdr2cNxbOF61mPzo1SgwWDUxOPguhNuk72VieDCQrSqQwqP0QBPv/2UPkBAAA6lcFONlFAwvTeCqDiGaVxW7To8nKSnstL3BYtcqwgSnpzCGlPmS6FkRzUqWx2ofnaQI0oLVGNaBHF4CMq6pLBMZLL3alslpdIZa6w5HIGKWcYsfJD5Cm5ptApTAi0k81iatygkQJrVCNMZEjeEilj8o0oo2BImrS3OqRKinCgURpJWSoF9VvIiF7WNC3hou7nJps6Rvj63lsh1h5qyfNo7q9o7Jf0D3HLEgh0oL3lAAAAAElFTkSuQmCC'
    }
};
/* ───────────── Plunder Bomber player sprites ───────────── */
const PLUNDER_BOMBER_SPRITES = {
    idleDown: {
        x: 305,
        y: 5,
        width: 16,
        height: 21,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAVCAYAAABPPm7SAAABoElEQVR42qWUoW7DMBCGf3eZFLBJhSkYCBgwdFjLFimgAQPtY3SopQEDHS1aH2AP0MIEVNpYy2YYMBCwSQksNKiUge4SJ3U3sCO2zvf9dz6dzWAw4fDS5JdFyto+ywQO4MJoDsq2kKXDBAohzAKyFiIRS4fPgpSEzmUt0sE/rdED33mq9u60GZgt9JuE1f6kgnHC4U6PgBdweAFHtjgKjhN+UkElsEXWyKZXQIKm2OoKc7sHV3EA6TFTUgNeUGd21Qhze49I5QAAJhxeroYp0jcfABD2u4h3e2PD9DN+94pxwusKIpVjbvcQ7/YI+12jAMGRyrH68bH26M7tXiOjDhKsj/YFDdG98HFZKLwcPuFb140qbm9sfHwpRCqHHnu4sh47+oTRGqm8kTXe1U1rx3YAQMrjkNM6gFuJEEzvpB3Lfnu+f5ksUsaEw8uJGAEAlnKN902KhyA8eVhSSjxvYngBhx7fGOWJGMELOGbDuCqR4NmwCZMx0z+wlGtjyQST+BYZLFmkDA7KAVxIKSuR9vdFfdJhWaSMnfsHzwm0z78BuJnMLUIpRL0AAAAASUVORK5CYII='
    },
    walkDown0: {
        x: 9,
        y: 8,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABTklEQVR42p2UoZLCMBCGv3QQSGRPIiOD49wxg6ASHgOHrryzuHsMToLAg2NlZGUrkXU90UknKaHD3apk83+b3WwSRc9MqhsiJpVV/nzUB96ZYowJIRFIafwAykEx4GFXES4USGXV6FUIaDUCpDQJ/7SuxkX6xXQ3LC72IGQhCDBbag4ry+akA8D5Divb+RKAC0UgvJ1tdOxrlUl18zl+AyCvy8FUfV2Q6u1Dc7zeo1A2nwRryjXeRcvmkyjoIJdV4op3juP1HkT253lddgcU9NHB/q5u3K8/kcoqd/xbsyavy4cd87pka9YAbE4aqaxSJtXNYWWZ7to+bs0aESEb1y1YjzHG8C0/3M6WYt/Cyt3VWD/75utGscXYs+oHVbHH68MxSCqr1CuvP/YLJEOi/nfxNFV3oWdLHb30zt+1Y6iuZ/4k+Bb+MFavHEqs/l8uArn/P6LtpgAAAABJRU5ErkJggg=='
    },
    walkDown1: {
        x: 75,
        y: 8,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABSUlEQVR42p2UL3PCQBDFf5eJiEQGiTx5OJCdiSCyfIy6aiS1df0YVIKoT1xXRkaCRMalgl64ux6ZTFddLu/t7ts/pwjM5LonYnJplPudhoQ1C4wxPkkEcnrXgbKkGOFPVBEqWuTSqHQqCbhhBMjpE/5pg8an/I3F6zi4fQeh9IkAy0Jz2DRsT9oj2LvDphnuEoCK1gN+fzXRs4tVJtf9PpsDsOvOo6m6uCHVcjWDelxjuZpxrK93jbvuDPUvecSO9XXIKr2Lx4tondgINoAtlNdH682NbM+hfhXOaUXLPpt7EXfdefhn51WZXPe25MtC82KeERHKrLsRuwxjDB/yOfRxe9K3dqxZEOtnaC4uHYYXqKR9uFahUxVbXpccI8mlUWrK9sdegWQMFD4XD1N1qxYb+mWh/Xa4FQu34JHeZNJzETmrKUWJ6f8B6XaqqsKyGRAAAAAASUVORK5CYII='
    },
    walkDown2: {
        x: 108,
        y: 8,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABVUlEQVR42p2ULXPCQBBA32UikJWJREYerriKCirhZ+BaWSS6jp8BMojOtA4cKyMjiUTiUkH3uBzXDNOdydzmbt/cftyu4Q6xWdGqLk1lANI+I18OTwXl/sQio5WmMmkIjBlire1AIsLou+rsGYViQCgiwo4aaSqT3gsBFxsBMtqEf0oK8DYpgZLha9yo/risX817FwSYbQvWVMy2RQdaTy5760k3OTeuHj6rqO4nB8DYrGiXg5zF+dgb03KQO31xPl5d9Q9CeXl8AKDcn6511MIvB7kziIlC6lkSO/T/9VNIk5Ro5mIx+h6E5wnQqZ9/q3/TmKErm3vko+fCGWiSQmhH7WAyWmOzop3bKQAr2fSWRMEd9W0/hg/eL7qu0lTGxJpXYYVCjxzY1/1zO0VEXFutZHNNjgJaI/+hKxTqxh8Zvmg8f+2bvgEVy+bdMXba6nc0AvwAu7+3SNwDlHEAAAAASUVORK5CYII='
    },
    walkDown3: {
        x: 140,
        y: 9,
        width: 15,
        height: 23,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAXCAYAAADUUxW8AAABSElEQVR42qWUIXPCQBCFv2MikMggIyOvDv4BSPgZOCqLRNflZwQJojOtA9eTkZFEVuJSkdlwt0k6MH0quby3uX377uBJ2DitbZzWANEQYUi8H09Zzia8fFFHfaI5CdbaQOSc40zJ7naFS7NmfGGfSEOKuKow0TNCoOE4IKYe8Q+0Pb8ujiTbY4dQvofvn9VbV7w+peQUrE9pQM4X97V8UQTfgm0n25Dw/VEMGta6beO03o+nzRj+mK+P3e0ahkQTfCxnEwCOl5/2J8YPh4iFqOELB+OpBRpiotE57vu7FNCejCTLG7tiTtIhyFZ3tytzEoTfiiWWOp66RxmRwPi59meosbErADJ3aOZdFcb0nV//kGTu0AoFmTvcT5WriqDImbI5OSpZurWo7/ZoRtEV6ufOtsVJv3dZ08aZR+6tvqKtYY9efr4/AL+K1aQg8bD1tAAAAABJRU5ErkJggg=='
    },
    walkRight0: {
        x: 8,
        y: 41,
        width: 16,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAYAAADzoH0MAAABgElEQVR42qVUr3PCMBh94SImkZ1ERga3ObirADn+jDl05GZx/BkgQXC3Oer4ZGRlK5F1nei+kKQp425Ptbm8l/f9FEhAZ6pNnVNtRXwmfQLVVuhMta+Y3MS07shEQIY2FhI6U+1lpnAorjBNBSYzseeCCGeUTkQC6JHvQWsNEIAMLdVWSKqtML/WYtuPQPqxn1F2AugLzLNPAMBk3f1PcxUm8XKyAIByA6yOe7zrt4C8OipcTtYRGSN2MM0Vyk33wm5hsaU9iKjLvgd+yFWBHXw8PQMA1OwLk/XNIp8DgGmqXl9Itl9uLOz3PLjgk5cvYywxdv+H4gqToZUc9184FNdALKjCENgyO/GJQRK5NDG4sUxTwTRV4MIJcAXi+FNifhJNU4FqK1wZTVO5CnBOuLH879jFQCOFzcJNtaV956JItPI0v+0Af6x9F7F910iDk5dYLPFSGd0TiC+nNpJ4dJ0NicgUcbewbh78qUyttVHqVb+UQ4uGOeJR60Oh/DsHPyw/15lZ2SzeAAAAAElFTkSuQmCC'
    },
    walkRight1: {
        x: 74,
        y: 41,
        width: 15,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAYCAYAAAAlBadpAAABoklEQVR42o2UL3PjMBDFf8oYHCz0QUPBDWuYMxPgzhy5fILiY8WGVxp2H8MHE5CZwphZ4IBYDWMYGKYDrhQ7Vpq+GY+lHb23f6RdRQSSahezm86q4T4ZHjadVZJqtyC7CIn0RGMgxQ1FlKTaNblmW58oz0c80ZMm3o3hQIvprEqACfEziAgYIMUlprOq/AjnOtR7ULEi/ZKfo0PL9DWss5f+P1/pniypds3eAtBuYL3TQWCZvrLeaarCst7pkejML7Y/lrSbXrkqLH/M377CA49VYadhS6rd72/fAdD5G9lLHxaAtwOU5+PYsw9Z52+TggyJT48PNLmmyXWwz/gitvWJbX2K5xxDeT6OQn16fGDyPO8hCNRjgcR0Vs1Xl4LdwoKM8txCfSNsX+l20++rwtLsLVVhOdB+CBynV3X9SLw3EQnNsCDjQBvaM/GL+eryPP0h/8ZFhINpJ32tPhsG156vB4K62XqRaXI9SaIk/70/49w/3PszwXa3JYd534LprFIxYrO3zFc65BxmGIwEZ7Fc/D0PJ4qIjPbB81fGbqxo/wGMrdCob5yBZgAAAABJRU5ErkJggg=='
    },
    walkRight4: {
        x: 173,
        y: 41,
        width: 15,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAYCAYAAAAlBadpAAABnElEQVR42p2UK5PjMBCEP6UMDi7UQUPBCdswpyrAW3Xk8jOOLTbcpWH7M3wwAalaGDMLChrGMDDMBxwpcuzs44boUeqeVmtGiokQbbqpfds6Fa+T+LBtnRJtugXplUikB1oLmi4mUaJNV2eGbXWiOB/xQA8aZbeWAw22dSoBRsCPQkTAApousa1TxUXOrdTPQk2Z9Ed+Dw4t9WuYp8/9OF+ZHizadPXeAdBsYL0zgWCpX1nvDGXuWO/MgHTmJ9tfS5pNz1zmjjf7t3c4yljmbixbtOlefvwEwGTvpM+9LAC/D1Ccj8PMXrLJ3keGxMCnxwfqzFBnJuzP+GJsqxPb6jR956kozseB1KfHB0bl+VkEgmpIkNjWqfnqati9WJBSnBuo7sj2Tjebfl3mjnrvKHPHgeZCcBw/1W2R+GwiEpphQcqBJrRn4ifz1bU8/SFf4yLCwTajvk4mG933rbUhMxCyjhrjf36T2RRItOlis77VkveeKpZuW6dUDKz3jvnKBJfD33UBxW4H2f4e/n3jn0REwjoGhsxflX5r2D+I3dBkXCAzPQAAAABJRU5ErkJggg=='
    },
    walkRight2: {
        x: 107,
        y: 42,
        width: 16,
        height: 23,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAXCAYAAAAC9s/ZAAABj0lEQVR42o1UoXKDQBB9xyAqI6lEnlxccGSmgsjkM+KiK1sb18+gshHMBJe6O7kSWWRlHRXMXg64hq67W97bt++WVQgEJboP3duO1fQu9gG2Y0WJ7nOkNzKiAWwtkKCfEilKdG8KDQDIGoaABThTYS2uaB1JLImPz2/8J4gIsAAS9LZjFduOVdYM0paqhyL2e7+iHQgwJ9gkrwCA9Dics6eh7UhMrEqGqRlVyXiz7zPw/qwdUMAAEAmYmw3a01BBSKy1IyLJ+aFEwcvDIwBAFxekR4yqSO7552s2FxElujc1QxeXUVIqCRgATKFhCj26i3x5SxF66mgJJLK36xW269XfBO3pPknWcDA3M9E3qip5ZqgpNLKG3Si7ZxRwjhQH2iFHiv1ZO2UypVMlavr7HmjnkjJQcjf9kRyBvwdypCAi9/HSXlD3lomQiZoD7Zwq58EUXJW3neC3YuphvMUjKaSmlX2wtFCVjP1ZzxQFTfRJfA98sO9PFFqWV7QjsKnZnX2w7Vip/2xkmRPZCX7RX/h93PRAPh11AAAAAElFTkSuQmCC'
    },
    walkRight3: {
        x: 140,
        y: 43,
        width: 16,
        height: 22,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAABj0lEQVR42pWUoXPCMBjFf+EQyMkiKyNTN1y5Q7C7GfgTJnHMIplkjj+DSRDcDTdcIyMrqUTiOlES2jTHxnfXuzbte3l97/siCJSKZBla14UR/lo3BBoQ38iUqsBaQ0TpEwkLzlIJQHIwDIgdsKVCa37IHUmXB0spBRqIKHVhRNdKSg6VvHu7h6ql4IccRZhgGH0A8LaHZFT9csd5sDdke8NmbFjrryB4urv6dAUDdFQky83YsH0dkn9CPMeRaK1bRPZ9MIXt8YxMv4nnzV2WvT4Ai8up1RcdKz/vNWXbXSwYIEslWSoba526NJl+Yw5D9+zX9nj+OwXfJCt72evz8vzU+tYpyD9hupMsLic24yqRei0up7ACXRiRjGSjiVY7zTtb/NlYXHI4VmS2lV2M9cFRSrnM/c70kxD1SbQf24Hxwf4gOYJ7Z8C90oURrpXr3WVrpibuApyxA2JmaoKKZOlSWO1eGgdJ/X6tv9iMDclINn4z6IGdyFD5Hj3kQba/KbBgXRgh/nugWo9svDaJX3TfzZjLJgbWAAAAAElFTkSuQmCC'
    },
    walkRight5: {
        x: 239,
        y: 43,
        width: 16,
        height: 22,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAABh0lEQVR42pWUoZLCMBCGv3QQyJOprIwM7nAwg4CZM8djnOMsEuTxJmepYAYcOCIjK0EicT1RElKawtzOdJrsZnf/3X8TQUS0VGVMb85WPOo6Mac+2T2Y1pWzMSApHwOJNmfn2EBhDHsKH6QTGsPMbaK1BgNISnO2IonV1pY9JjUEe4oGiqFc+nU2u+t7I3UPoKUqjxt7MwCmQjGUS6a54ndsmeYK8iYCX0JvpChWcNzYqknG1DL/jm17CVqqctFNsbuUbLYFYNK9Ms0Vi27K+iO9HT/FEQCowbZhXHRTv568v3EcKI4DVdMnYf0Axar6z68n5td7xvXhwvpwec5CTMIgAPNdfZ+4Bj4T18A+GV/6s0a174HdDWmbSse/G7Bw0DyN8+up0UiXzSF01IYU1y6TG5g+WS2Lu0Cxqy0cC8WKatr+KYmjzjk/Nsx9fTJvCxuZAPzkE6+c5qoxzsYYvsdrX14oQktVhjXH6o0x4850zNkKJCWm/mC0BQmdzdkK8eohffW4/gGdV7r5dAGLnwAAAABJRU5ErkJggg=='
    },
    walkUp0: {
        x: 9,
        y: 74,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABkklEQVR42pWUoVLDQBCGv8v0AZCRnDx5dY1rZxBlBtM+QTUuogaegTfgEYqDutYFx4mKcz1JZCXuEOmll0sYYFXy3327m83uChLTufIMmKmtiN9HKVAgqXB8TBUA472lQEKOjx1kASqQ3OtF6/Ht/dSJeK8XFMg2gAiQ1vqSljFUOEIG4cwYA0CFu6Ta+U6t0ehBPcA9MI4WLM2oA8bAZm6RZaO7J1huoTKuKVIKVrgeACBL+Cht6yDAoxRyT2D3M24nV011706o6Q5ZwgbLchtFHILC77idXPG2nwExrPrFCZCa7pqIZ0cuuZelYAwBqOmu1wwAmamtWG5V70CWtIWKbblVmNqKNuL4RvGbde7oXPnjCu8PeJ0rr3PlX69n/rjCH1f41+tZq/tDo+lc+RHArn6ANcALBZLHLwdt+p/txDyvH87ay3Cvxh3yk4mh4U3BtHdNbYX4y/QPbYHsJ8jUVqTrIr7T2QCh/cKkB30zt5fxOsNZeAjzNvTTgxbu6Fz5XnE286aJY0u1XnH+sx6/Ad95zsZS3ogEAAAAAElFTkSuQmCC'
    },
    walkUp1: {
        x: 75,
        y: 74,
        width: 14,
        height: 24,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAABeElEQVR42qWUsW7CMBCGP0d5AMaMzejRbLAlUocidSFPwMzGg7DxGLABQyXY0g0PDN7wmpE3cIfUqUmsFqk3Oef77s5/zhb0TGXSETHdGBF+p31gSk6N5VJIAMZnw5QcMlyYIPXQlBylFFprAA6f94eKSzVv9zKcbowQIdS1pTU1Ft9BbC+NnUcphULxmw3AsJq3ftUBuNE7ALZvhnzV+uwaqiPU2rJU8y62O2ONHQBAL4HsVE+BB8iuwZxLZpNRq+77HVmcyFewxVAdg1ZjkP8ds8mIw7kEQlgOxfGQLE5txe9EtheX9MEQApDFaTAMAIlujKiOcrCRr36ECa06SnRjRFdx/Cr5yx5iVCbdbYFzV5zKpFOZdPuX0t0WuNsCt38pO7+7tj6VSSdUJp0f4HogAdEJ2ujdUNXYeMWSitjlDeEYpBsjxDO3P/YKJM9C/ZgkfAH8+Pm1b/vyYbpXwMNJmCUEYqKFlRPfd43tRAjFCH3+vv5LnC/VmdRLkE3HiAAAAABJRU5ErkJggg=='
    },
    walkUp2: {
        x: 108,
        y: 75,
        width: 14,
        height: 23,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAXCAYAAAA7kX6CAAABcUlEQVR42o2UrZLCMBDH/+n0AU7WRkYGd3XtDAJmzpTHwJVnuHOH4zFAUsEMOHCsjKytRJ7ric6mm7Zwt6bTzf72O1EYiE1Miwmhxin5H08B98wAAGYXhxS6UyZopYOYoRQa1lrs6IDj7dFnYG33hQURAQlaapxSEmLZ0QEAsLZFmC4RAOCKuk9VyhCQ0RkegUSEK2r/zzXKjAKQgf3CYSMMVhUbYBpkSJehwb10XYfnfXQAUDwGCR0/cm9gsrPXz+YGKTSuqBFJqN4C+Aobo38K7+h+cr7+aGR0e8BkZ5js3EW/PbB8f+ucCglAhmSarB9KNDUvXWLUpOHeRtQ4taoMXgk3aDbv7SKbmHZtC690lxz1tmuUu+QBNBoHrxjv6CvhccRyeflguPD7hcOwnJgap/iu8QaBwt3UJYCqP6fGKfXX7V/bAnnyie9q6e+rBxlIobFZHIO0ZENkxEhCz4yn3iX16oEaOuI9/VeNz166XyietEPwUZThAAAAAElFTkSuQmCC'
    },
    walkUp3: {
        x: 140,
        y: 76,
        width: 15,
        height: 22,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAWCAYAAAAfD8YZAAABcElEQVR42pWULXfCMBSGn3AqJpGdjKwMjrpyDqLI8jOYqp6cntp+BkgQOwdccURG1lbyD5iApJeWj+11afJ+9N6bKDowcXLiDmzjlFxHt4iHLAFgtHMApOjzgZiTFIkkMUVTUbPeH4PgwhStOAZrLcScbONUJInGGAyGd7vqESVSNMScolub90gAxlzcu/8MYK2lou47XYh3C/ZtVyxzx1fZfqs/Yb7xytdGSlZ5mTt0eSZ46FKKJCFFRd2SJdHtJgAk2bYnMpqeBSpqBjKGJM7GQ9xuEtY+zeHHhZoMuspJtiXJtqz3R2bjYRCRAh6BPJomQUSXBIFHGPgBSdHMN0nvwCOBSPavsnWI5qNK6LJNCKDkaMoB+Xh5DTXoJvLVVs+uoccyd0HkqlW2cUre1RTNwhRhxhemCN1YmIKKGts4NbjlUlGH4fd4m87aey3H81n0LunKWRJTNMvc9Qi3nqs/OUt33w3bOKX+8wB2H8FfO7ur+BAfa5QAAAAASUVORK5CYII='
    },
    death0: {
        x: 239,
        y: 175,
        width: 16,
        height: 22,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAABfUlEQVR42oWULXfCMBiFn3AqJic7GRkZ3OrgHMQ4ZwZ+BlPVyGnU/gYWxM4B1zkiIyOpROI6AQkpTeGq5uPe9+b9qADQuWq4wtRWxOsY92emtiLTuWoKJAAVDr+ucBxGCoDh3lIgIacB8PfJaQZercJRIFnoWYi4+Tux+TuF9ULP8OIewVKBRGt9s2tMuPjoLKMHWms0mmfIUkmLI3jcuwhJ7COuPyyyvOy7Fcy3UBl3S6B3EC8qXIcIIEs4lDYIxSJZiuxWYPdjpu+vl2p8nlCjHbKENZb5NuEgRfYlnL6/stmPgVhE9VfBk9Vod3FwFXSJu4OUQEwGUKNdq6E6Aqa2wluKIUtCQmPMtwpTW9FyYGorhhP1tHGGkxsZQLS6L2qo75e38Ay7H7M8H0Og3j6Iu255dhCedewMUSeJOleNn8Sf302YygLZIt+3fZaK/jWR+LavksXrKaMxJvndmdTIxSBlK+Vq/WFbM+A54n4j/r09gq+GeGTvEdHjH7yMv10HhrOYAAAAAElFTkSuQmCC'
    },
    death1: {
        x: 470,
        y: 175,
        width: 16,
        height: 22,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAABjUlEQVR42p2ULW/DMBCGn0QBhYUda6ChxxbWSAPLNNKgweEOFe837J8UtgGTWpayGgyY1WMrHCzzQObWSVxt2klRTme/9/X6LiIgciRsyK4OOurakhAwI6XGsJsIAK43mowURtiuo8QHZ6RIKVFKAbDafrWizeS0ORthnZN2BlKe/wpejgaXkX9WK9MuwUXvOpPIUCtO5aiDjpJgs5SixvRALouLTfSBiztNOm/s5hXKCmpl6GYaASzHuV0dB9SYHhDoOBJkpBSDI/cf63MJPti8gt7kFDfDho2HL8RkTTqHBZqygoKrNv/7J6x9x+6fsMtxbu3j1C7HeUv377g3k5wZ0CeHxc2Q1baJCrD6ycYEmIhDLPhgADFZ9x6Vk9hxXlaid5jOzw30pazEidJWBte3gt+keycKTd/iTqM3+amMshLs3nQPrA46ip3iPgeAhsqyEszktDVQ/kQmoZmXI2Ffjp8t+/NtQXapib8tEzfeXb23D/iHxP8FO0x8adf54o+20x0m+utCvbRYvwEe6M6uyA/L8wAAAABJRU5ErkJggg=='
    },
    death2: {
        x: 536,
        y: 176,
        width: 16,
        height: 21,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAVCAYAAABPPm7SAAABb0lEQVR42o2UIZPCMBCFv3QQSCTIyMjgwJUZBMxg2p9R17Mn0bj7GZxhhjpwPUdkZeQhkec4UVLSEo57qrOb97LdvF1BAHqorqG4OVeiG4u6RD1U1ykSgHV/xClWAEyRTT4o4IiZTlo37L8uzXemk0bIxYRP1lrfyzWGEnu/PZAz50r0eAKtNRrNKwQF/NsdulUEBXzidlEh8zpuN5AWUBqLa3BQoMQ+EAFkDqe8aoR8kV6IbDdQHWcsJ4P6JVYXVHxA5rClIi0CFYTI7gmXkwH74wzwRdTzJjqyig91BTdBGzgbhWzrkwFUfGgZyjdf5BzmSvIhc5qG+kgL1Tg28m06nquXxhnPVcvu4tn0rfsjlrtbD1Yz3n++g9Mpuv/k1D/MZ+uwH/fHWnSnscQGbetc6s44kQcnArwt9qRF+9G2i4qyUA8zEvk9yHRCphNk3rbrFInM73mfE3VXlTGmmQEfdlPnuutN/GcX/rUbfwEjELpZrMKARgAAAABJRU5ErkJggg=='
    },
    death3: {
        x: 105,
        y: 206,
        width: 20,
        height: 23,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAXCAYAAAALHW+jAAABpElEQVR42q2Vr1rDMBTFf9lXUYkscnLy4tgjTO4VkPUYJsEgcJO8wiQWV+QViMrKVSLrgtgSbrJu419M2iT3fPeee07iODKkmnlODO1bN7ZeHAOaM0VEuHl8SPafb+9QVajwp4ATwLpaeP+Ol2oWZ/vt3/F1tfBjVRQ52Jwpi3KIa90To9+LcoBhChXeZulywPvyktWwBeC+vNwFX1/w8vYBEPfC/mrYJmVP8pRtwMtQJv+rYcuc6ejZg5Klmvlalqx1E4NEBEG4et0AUMty3+Ld1NCxj4llTyx3AUxEaOgAWOsG7VunfevWuolAIkISs2+Qy6USgLRvnVQzn8sirB2LiRyGzGJZRzRm12pZxkwPmiIiSYmcGZaCEAtQBP7+OubsNJnI5rvZjWUZhZ3b5yeAY5dIYRuyz9J/FzRoF0BVaeiYaN+60PbYuTNXVw4WtJnIRlV/3eUQm1ivoQMlWukUn6GCWpax1APAqHj98mwObIEsb9YtRSJs/crUuiYAJy4yYCJCo116HwaS7cHcBZYvC2Z5d+ceptxFlq8x7br/fvU+Af65JJ4LToNfAAAAAElFTkSuQmCC'
    }
};
/* ───────────── Bomb and explosion sprites ───────────── */
const BOMBERMAN_EXPLOSION_SPRITES = {
    bombs: {
        fuse0: {
            x: 0,
            y: 0,
            width: 16,
            height: 16,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABSUlEQVR42qWTLU/DQBjH/y0VfIEm9wVIOMdhIHWbrEMRJqmYaLIEvWUJScMHIAyHxdWQgCzuMkwrIDkxUdmGIOpGgjjEdtfXEQY/dS/P/3n+9/IY6IARJrvWkzwxqjHhyS6MTiFxQCkFAAghVps5ryWbTV3Q/Qg7NTFx4J4PceoN8flVoHgvYNs2Pt4e4I4C7B31sXiJMJu6yBYFvMu0FLMDX46vHmWWxTLLYhlGSzk4u5GMML3OCJP8dizDC18qt5ZyoCwr4nmkx4fHfXABTO45/IFTizOVdQUXFFxQpK9pK1k8j+COAtCep51b1eorUVSrQHsenq4nAAIdI57vAOIAOS+PoKhW1hBnnaScKyz1VM07UOhnJE7nvtkK7BL/gLWtoOUgyROj+ct+Rc6R5Ilh4p+Yukm2cbGuDmBzM20SNrvS+Gs7K74B0DebyxOmawAAAAAASUVORK5CYII='
        },
        fuse1: {
            x: 17,
            y: 0,
            width: 15,
            height: 16,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAYAAADJViUEAAABMElEQVR42qWToVMCQRTGf3vDH6DtjMZrLglpEK9rsDlEHGbMx5gY/gBGbY7NRoSIbSGxwbDBQGQjzfgMcMfCMaPiV3b37X7ve/O9fXAE5rVLAVCHLnWsJTxbb1VIPNGwslA5SIrr26A3pWSnV2uy2iHGdZIkAcA5B96QdnoAjAddnh5Slp8rzqdzqrOpKoj6oi1ZfyTDyZdk/ZHoWEvWH8lyORcdazHPmQzv2xJWUZSdXqfc3Z4BDmgyHkC11sQ46L4Z2jf1kjeRjrUkjdaum7NJaU07PfJ3uXqhvPhY8Pi63SeNFuNBF+gVMff+sjbTGwDUvlEhctMK5F3wBuutqoQPwwTOOUpt20OlpPQHRNZbtVPaT9iUDBDxD0TF3/2NeqBaGoyDf3tD2h+Qo6YqxDeExZNgQsVqAgAAAABJRU5ErkJggg=='
        },
        fuse2: {
            x: 33,
            y: 0,
            width: 14,
            height: 16,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAYAAAAmlE46AAABJ0lEQVR42p2SoU/DQBjFf236D+BO4yoQh2J1m5xHMDtFmixBb0Et+wOWAYI0OAxpUJvsXEGtAnGCZJOtxIH7EF27NXQs22fuu8u997539+DAWl43BMA5FHRyCUsaUgvUSkvRJ1li1d1xagHKyw+yuEKSnbXgJeL04c1ytkFus1uSmHlAuzcEYDYecHfbJv38wn/9qSp1ribSH00ljL5FKy390VTSdCFaaYnv+xLe+LKtXhn1/KKF55qyjw0MnmP8jvfHo62VltITMHlKAVi8R+Xa7g0pbBSqFcXwMQDAbXaZjQdA7nH1scLMg/zRsrg6qjEG13U3LMpbgzf7nd9hjKkaUd7OMNhJlliF/N7K4jIQNkeWXcZqn+qWGoD1b+TWgLrMWseG/BdvqH5WjjsArAAAAABJRU5ErkJggg=='
        },
        blastCenter: {
            x: 48,
            y: 0,
            width: 16,
            height: 16,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABX0lEQVR42o2TIXODQBCFPzIRF9e4q2skouIsLvwDJhOD6zBV6S/oZKL6CzJFMnWYDFOHJC5TVUQEkkpcLI4KOCBNyPSpY3ff27d3i6GkqmiQFqkBoGNJKDjtYPFZXs0DjADiNCAJBUqqSicjR1CaPtMlBA8CTVRSVUkoiNOgExDZCtstQVqYcw+A6ZIWd6o5SAukhe2WiGwFQGdJWpimyexxBkC8XZ+PIC3OUBxIi9QY629Nfnm6byJv2O666zyAse5+DebcI8uy60xpoaAa92P5Mef9ozv/ByN90J3yY96SB7s3IwOcOcj2wc159eX1a0b9ROSIuuAGWddk+2YP0iI1dGKy8UnCAZHiQBLWNZEj2s1sHUw2PiJbcdoNGzjt6qWbbPw2ZujVzF/B+ylvv3vjLHIE0yXYblkL9N/21o0vnj2+vxLi7bpz0C9sxRohTeyvd/+vvBC4EPqDPlHjF21il6TcejMoAAAAAElFTkSuQmCC'
        },
        lit0: {
            x: 0,
            y: 18,
            width: 16,
            height: 18,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAABPElEQVR42qWTIW/DMBCFv1QDgRsLTKHBgIuqsBSWViOl5v0BU2C0HzAeWjJNZYMr84YaMBDYwfyEsA60tnKJV9Inmdzde+d79sGNiEJBnehTKF639ah+MiTqRJ+WmxKAKo2p0hiA5ab0+aCAS6jcMJsvALjX5wMwmy9QuRndcOICrtP0cQpAsbWsdh2rXUextSJXpbEXiYRikkFrPSFTDQC2UQCU68zXOE8inegTSSadaS3LTelHOXx/8vFaEKoTAkopmn1FlcaY307UupjKDU3TeIG74bOo3GD2FcXWihHMOvMmin/gDDTdDKWUMKs/AsDx5wgwvsH0Bd7fDqy+zmO4QpDEECYAx2d4eEKqX4hDcj8vntEb1zN0CEFuLXVbR97EPjnU6eoIoSW5ikv30TaKH/kPcdjw5nW+GX8GK5onNZQU+wAAAABJRU5ErkJggg=='
        },
        lit1: {
            x: 16,
            y: 18,
            width: 16,
            height: 18,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAABKUlEQVR42sWToXLDMAyGP+cKAgcDU2gw4KJeWApDy0rN8wSBeYLx0NCywZb5ihYwENjBPEJYBrb4bCdbwcD+OwNLv35LsiRYgUrUtGbvhk6EtigMVImairIGoEljmjQGoChr618VmB0y1+z2BwCe1NcB2O0PyFwvMoxmw/zS9nkLQNUajueR43mkao3na9LYighPMclgMDYgkz0AppcA1KfMcuaeCJWoiSTzOzMYirK2pbzdLry+VKzxPAEpJf21oUlj9MfocWebzDV931uBTfgtMtfoa0PVGq8EfcpsE10sMnCb5ZYAcH+/A/yegUuES3Bfwhskq+wIhcEhJ+qGTszfskb4MXgwdEMnNg+JDxDZJXGyeIjv1+0kLrYwHBgnMNxK8dd1/n98As/PkpwJ3lD2AAAAAElFTkSuQmCC'
        },
        lit2: {
            x: 32,
            y: 18,
            width: 16,
            height: 18,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAABRElEQVR42qWTrW7DMBSFv1QDgSsLTKHBgIu6sBSWViWl5n2AKTBPMG5aNpUNtswaasCAYQvzCGEdqGzFrsGkXsnA9+f4nutz4UnLUk5ZyFvK3/XdQ/4kLpSFvK12LQC6zNFlDsBq1/p4EsAFRK2YL5YAvMr7AZgvlohaPXQ4cQ730uxtBkCzN6wPA+vDQLM3QUyXuQfJAsSigt74gkpYAIwVALTbyue4mWSykDeKKpxMb1jtWk/l/HPk+7MhlRcACCGwJ40uc9R1CHKdT9QKa60HeIm/RdQKddI0exNQUNvKDzHQQdzBeFhjCgCX3wsA1lp0fkZdh8cOxolwjO734q/3M9MNsI2E5LmNgOJigOkGLh8jKcc/4agkwXvjB9r1XZakEHcSWFGhriaUctd3mRPHf80tVpbcwlgwI+HEW/n0Oj9tfwQvmoxZnLupAAAAAElFTkSuQmCC'
        },
        lit3: {
            x: 48,
            y: 18,
            width: 16,
            height: 18,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAABSklEQVR42sWTr1PDMBTHP+UQlZO1lRETQXF1q8TOVTLPH8BNTiO4Qw5ZwzEJrrgcahGIyNk6KuuKyCU0WTck7y53yTff9837kQf/bckUKDM5LPs0wF7THt3q5KyAzOQAsOxTxAzKZ4s3t2A6KwIEQhexs1isvOD3i13O3J3jegGZyaGpbcj5PEfsGkwH+t0u04HYNeTz3EZUp14kCRSzAlrFulYAFMIAoIwAYFMVnuNSSWQmB7IirEyruLnbcHVdArD/bHh7XDPFCwSEEJiPLU2dUlZ9wHWYWKwwxniBy7gtYrGirLasaxWkUFZFUGDfxjgCV0ggSAHg8HUAOB/BmAhNdD62i/HBK4+EYueY89vGqMIunVOOtArd6mQyBVrF08M+gMqqP24j2BroVicSgigO9zCTdt9pJl8/OUzj3+Yt+oF/jvMUPjXOP567nnBaLj2vAAAAAElFTkSuQmCC'
        }
    },
    crosses: {
        thinLeft: {
            x: 3,
            y: 43,
            width: 73,
            height: 73,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAABJCAYAAABxcwvcAAADCklEQVR42u1cO3KDMBBdMRQuXULnNjdw60twCZ8nkzv4ErQ+RjooKd05RSwiLbsSv4zWo2UmYxuMhB5vn5anjQ0I2rrz4QkAUF2O0LcDAADU94dJfV2FRIDcV7vfvmYNkseYpv79447nCpLLHu5ztiBNwgkxSEFaGEapdKkAwZud4Sw4qXSplAZK5Yq3hltkdhMys4kBydOaAIOy1qT6/jAUADgFSMWoQhKLRlBunRgWyUwBbh0Zcil1qZSiSdXl6INz68YUQDNuLoxegGXvAnTnw9MDgdCi1HqUHKTJrEZo0QTInEAi2eEy6fWeSw+yAAmzwxNpFHbZZ9wkACjsstakuYPPmknu4KW4kPL9JIGupOhwk5Jtiwo3iVokLtz6dtCMOzRwjjGpvW1xySREDDe1b61VInQrxfrbTQ0VAHQwPLNd5l6jN9ktBFhwggNvak+b/tMRCLVbzFqfDzQS+k5sQLjcZg3z1vRPnRNq11DmFj7RHqNeQ2YaPp+68BEgq0c2V0J+N87Ct/Q/i8XO+M0eMe8yYcnjBAsQJeTOMdzH2v45FuObYdi1L+KEYFg0NZsx47aqr48paygGAUDM/17TPzkW3K/D3pK9q3Z/6Gkdr5HhC421hS/Mfj5dAb4/4w7Blv5jjoPTlvHEcy+rgllgZI+5+07Xv/0WqFB7e/TPMNYyr/QEkBtAjNqUdjDU79sBqj1uxpb+KQl4RRLWtIkmuV/kTpozZcfEc2Ste1Mwm9xws8diurSjF+WmBLOmc5wGrF1Xw1OvB/YCwZ4LQqx/Kl2gNkMtBHIncce3PmJwk0Zo2t/aPxALn9y4za7L1CtWXEkHAOVNOG/Zs/85mxFbVYIqS7J2AXZ7GM7RmaTqk7QcUOuTtD5J65O0Pknrk7Q+SeuTtD4JtPQGtD5J65O0Pgm0Pknrk7Q+SeuTdHYjbdu+HVS45zy8phbst/iFCWWSIKa8VzIp7L+4ZSaTAl1J2QsBqklTILSOGxZaJU4Nt4Yb94CLBFztW6w9kSKJFJsBYT+hKFG4fwC/z62Ejpy1NAAAAABJRU5ErkJggg=='
        },
        thinRight: {
            x: 83,
            y: 44,
            width: 73,
            height: 72,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAABICAYAAAC6L9h5AAADs0lEQVR42u1crY4bMRAebwMCWqkwUckVFx0L7UvkJY5XqlRYVB7WJ8hLhB47dCoN27AGBIRtwcaXudkZ2+uk57nzrLTK/sQeezI/n8ef4kDJ0S6mHQDA7OtHAADYbfYAADC/P7rSY2u0KAcrCF/j9/j6JQ+nzoqW8/OLdavCohot7oatCG7u+Oc1Kgm7j7cYTlFSm5c6JiWVJLrQdsUqZ35/dCXcTo274TgE67a3JByfas5urEUxyqk6cA9izHIuxqNSManRYEXsxLer3u0UWFSjyor88esHcFmvFJhs1GW3dXuOSSQ2lYpLTkNMegKMOB4hdyuNup2qdRuX8k9LkyqzmweHA1dThraLKonNaoH0zyr1LSsp2SIQBBChwltVUtQiFGEkXRCABm0miFcXk6SKJGxX57ikBCdNNFjRbrOHmb/59lNdYUJXqURJaUSlu6VktyqV5N3tye0EKyqNtnXWk8zdEjETqnFXv1vCxh+8CXBywdLWps/d/CaAuVvg8DiJKKqkNTXXtIQxE2kX046SJHKCfI78WD/0vsnJOP49/qTPYoLFwLxdnc+IcnPl42QhPfP37WLauVDNBnfg34UmisusVBC+HigohLRJCRcCPIKx8lOzr8vxezooag2xCe02++dtvJJowPbWJCDvq8ln+sN9sBYSjRHL+XDgfqLSUkKyFrw7QhWFXc73K8kZI5/KpO3Q/HabPTiOZTboMGfxybXDOyHcwaV+bE1jxpAjX9iEcOy2jjRw3zkVJrlJoKgf7FOypth4xshPaXtS0oQ1SWkgN3fn+xQh0uBivyhVVO4kQ317y+S+T5KFE6l4sYnEzB+/TzFzyTr9pGjbS+VH4hLOlM/djXO1SIaRNhST3odcm/7y0jgukR/ImBhKOJHYSTrCjUPpM5Yh2fQbym4pP9RI+VyaD1UnBhAg1jinDILhBZWVnDkTQOVY+Rzw5EB1EExSxEo/uQHkktvHou5L5UsrjGAfOYvHS57hNVf3fdZ1D7f9+fd3fz7c9s9PJ16fXUs+aGaVUEscQ70pwQnQuc39n9oaP8n4ScZPMn6S8ZOMn2T8JOMngfGTjJ9k/CTjJxk/yfhJxk8C4ycZP+lNZbd12+MkVPivOnCP2RCo2t2CazdSATB3MwiQUS5hkPar5kxeHQIwrleyKgkA8E5D+n//edo/eDwAfPrTX3/5APB4gMP2WPeyxE/+WtvqdZVKFHG49a3d8NJEUfB2GvbdJNK7ln8IdKDsLxQlZF5SUf8AnXRX3gaekrMAAAAASUVORK5CYII='
        },
        fullLeft: {
            x: 0,
            y: 121,
            width: 78,
            height: 77,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAABNCAYAAAAIPlKzAAAEcElEQVR42u1cvW7bQAymBA0ePcqbHiHt5DUv4RfIVGQvEKBP0N1b/QJ5iayZ0m5dvclbNWa7DjZtiuL96JxYNMwDBEuyJEqfyPtIHnUAilq7nDlpXdqeuhWgrIUAWry+F+1y5hav7wUei+s3CxwFrL6f71dWC4Dn9vi7e+lgKqB4K7UAh4D0QBN+EeCpTbdUaZ4IVvN4WgioU5qoKuBEEJpHgPnDflHYSrWkQAHD9dWip3UGHGm7l25PCN1mqIExLb15csA+LtNtuUSr1Jrqdg3QgNpWqryr53a/bNfjCOWWTbXnkty9BZl1SnPVqXGrxYAMjpqoROvKa4hRodsEzdZMVQLsz9c9aEzbpjZVVUH+MU6l5or9G2rdIdg3U/X1cTx6UNaqqyEGGllYHxdoXNsO5NAzZ9M4D5My0ChB3LwDHGXGgBsyJatWKt0QdD94f7daq9G6SpMf10Lnas6s2N/xNJORg8CaNHXOSELLgI3ekCvgkmgYY1XHqvX9fKhpysxUf6zqYVcNpqo3Axzx4ww4Vt7g9d0IaBrGVSst2jYAgpLDdn1iWmPVBCc4gWHVAJdD9aHyrNH5OIwWPGDV93NolzPnk3kpV6UMvf1YjRq/YV6ClUoEufHqR8lPrc2j+wtff4MH+WrS+HGY7pHyZb2On7ycQWkXjRgiJMHlnCt/bJdS+ADLclwzEo+Dsq5Qfya4JXj9s+V7zuUvBMErJJWkD7P79jctecjLFsb4XBw0nsSUfDouI1c+npdwLQpez+TEt89vVKrrkLSEagc9hx/780cwqI+Cd658ib0xG8PlkKrQamCe/CEarON4BPgu3By9EfrQDfG/JE1CIPD/2LgpHe3C4zkIOfJ9wM8fAGDd729XC6gBoIXO9RjJPdXO/f7i3L9frtf4Nu6T9o9p9Bp8PXaOdJ+58ul1pHUq86l27XLmyigZ4JvJyVCknJNimlILmfUY+ZKmd5v+uYKcSmRSXmKFZsH7Gb5PGplqIGwmfLvbnPoY3J8Kbq78YNQiA1z42DRIBj4NGBsy8X4KtyWgfA+LcnLlA/gTCgF2LYJlCDGaDwHsE86P4f/7yAaB8znFufI9ft/gWwuWuo86wBRI6kzGfLvUEXexdDWmIQk+2meO+PeAk1I8HxEw+z4fEkO2EIDMn0wFJibfF0ZKGETTWSmA0cCXB8HSvlAwPXCH+ELdAeIS0OUc+Z+V8RmVJTknmeme6v7CfTsG3CVTSVxGmZNojG3DZ5Z6CWZ6iYwwl2H1cWD1cVYfZ/VxYPVxVh9n9XFWH2fkYPVxVh8HVh9n9XFWH2f1cVYfZ/VxVh931e7IMYBHs+Tf4x/2a3BH9M6t5BvtUsKq+kw1dRzXgIO0FJMiV0RnPg6zIsJMN1qyv+o0bgCMsikzrmeKoOdWnALNTDVQ4NwjCYWap3uKoLs30QHWME9meRXTA3ncl5tPnVMAdi8d1Di+0Og1VZUTKA8KHIXSB8uOsAwJDtoAANQKJ9xTq3Ghfo9/KjXl/f0HEAbTOzGUl5IAAAAASUVORK5CYII='
        },
        fullRight: {
            x: 80,
            y: 120,
            width: 80,
            height: 80,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAFRklEQVR42u1cP2vbUBA/OR48pKBRpos7li6ph9DVX8JfIEuD90CgQ+fuJkvzBbx3radCIJBkKVm92UOhGkLxEFAH6Umn0917shWaK7kHgUh+eu/p9O7f735SBMra+sMgc/8nk7j222aZAgDA8GobaVlvpEFgw6tt5ASXTGKA6ZDvvFiXQtQiyN5zLwALoSa80Qzg6Cb/G83yc9NhuSu17MK+NrUthRefiP2TSQxrSDMNguxpEGApBE5100uA1bw6Rn007MJIndOYDiuVpW01B1isVTkUNTawZv9W82rXxSeiOmvYgSpsYKNJNrDYfZpaT5UDkQTk7GCxQzfLVI0XVhXG1Gzd3TgXHHUitgM9DXth7EhGs4ZjaYQ+JkBoCo86EKTipsIhG0idCLKBySS2HUgzi1rjPDBK58wGtrGBnEClANviQCK8uzHvTBQ2PQJcrOtIDKfK6WWFygDAGtLsuZ2JCgFulmnTDmKBOSeisEVa4KxSgJwdxGrsBFmAqy8eTGiEI4t1Fc44UJWqMkGmzQtzDoUCCh6A1XLhkPAYPNBqIm13HudQbAcGGhUWPkZORkM6F2mqB3shfRTGbE7v1ajwgaaq3OGbAcDPB4Af3wFe3wPEx8iJHAOk1wAA8PDtl5U1vYACjgWxPRzlOzGZxABXG0vlgoCqJ3RxjAZzIoUtqwXGnA1UCu3r8sI4C8G7j3hlTUWlvsosRIr7RjOAL59UqXBfHZjgS90UBtMRfZL4uM1Tpv13TbOy8yTzVuSkeBABCl3m5wJyev8+mURtInoq4La1Dcrl424wO0+yBpAaEh4qQOE59pm/xktkrqNyoEKNuAGkRYhFILx7nBNw5xi2Qe2mL942hSeFL06F0S7sPL/vXsj1HLkzqqVQ7kaYJ926Gkav5yB7Oq4E4fsarpt0md8H4krjoEigXxuAsgHcAPR3PDDud3RTnJw3xzvja7x7CU9CqbvO7x4KlQNuZ0U2VNRk8h148bZ5I1hdpOReUru7sT+TcL+HvC5VX6nI1GV+7jp3Hs9J/1/NYXN6T8IYigCnl/JCRp6bD6Rh4iJ9zde3y/y+69qsKztPsuz312yvtu91XcbDfZ56/l3mvX2fZedJ1tspSFWKCsO/AHiFPLznrW45fh5Vo9Bkvj7096d+KLvOj887TuIO1/aSSVxxkumNOalzxlpaBHcN54A4Ie7jSJ5yfnoceLibZQoHHx8fPx/+eQR49ypHfbe3+V+5kOv8/GDMB7SDvnyNO++uxTfoxtze5se4n9S4Nbg59p3fnUuv8xjPIeFuvEG/PiaqDj6stlBlIi4jCPFVdqFa0LhRCl53jQXbYoNt56fZCs5iuCAbBdPNfHA6DEfpIca8sDgxhaKFpJAgXcArrWHX+T35b6hvJKEp0gBtKBWhtyzxAyuJRb4XbCi4yrxw02V+DoEJgSdlLiy9OSkNIgk71N8HI7HEIk6tPcLbd/42sJcbj+sbqWRm+fiBythZxg80fqDxA40fCMYPBOMHGj/QBAjGDzR+oPEDjR9o/EDjBxo/EIwfaPxA4wf+J8G0GhUubWAoE0FfcDMBSjmttNNILmw20EeiHOkXnrpUjq2PCOVULemcqh1YE17J9SOqLREfX7INrKEqDkzw2UHDAwNOxHF1JLKPIluo8/uBXGmT1IRNhSUscLGWhQf24R3R/m2WKSQUkeHUF3F3NKRzfQ32LwjNxydVXLiaq/qiuU5AlXt1oQ071nLhohWISy2IJnbQPsAohTGU1Ei/o4q8sFXl2lLdmFeszAtLr8wW38hPWr74+NztL787JmcVH37GAAAAAElFTkSuQmCC'
        }
    }
};
const BOMBERMAN_SPRITE_SETS = {
    player: BOMBERMAN_PLAYER_SPRITES,
    plunderBomber: PLUNDER_BOMBER_SPRITES,
    explosions: BOMBERMAN_EXPLOSION_SPRITES
};


/***/ },

/***/ "./src/bomberman/core/game.ts"
/*!************************************!*\
  !*** ./src/bomberman/core/game.ts ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Game: () => (/* binding */ Game)
/* harmony export */ });
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _renderers_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../renderers/svg */ "./src/bomberman/renderers/svg.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "./src/bomberman/core/constants.ts");
/* harmony import */ var _ai__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ai */ "./src/bomberman/core/ai.ts");
/* harmony import */ var _rules__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./rules */ "./src/bomberman/core/rules.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};






const placePlayers = (store) => {
    const playerOneStart = (0,_rules__WEBPACK_IMPORTED_MODULE_4__.findNearestEmptyCell)(store, { x: 0, y: 0 });
    const playerTwoStart = (0,_rules__WEBPACK_IMPORTED_MODULE_4__.findNearestEmptyCell)(store, { x: _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - 1, y: _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT - 1 }, new Set([(0,_rules__WEBPACK_IMPORTED_MODULE_4__.positionKey)(playerOneStart)]));
    store.players = [
        createPlayer(1, 'Bomberman', playerOneStart, 'right', _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_SPRITE_SETS.player.idleDown.data),
        createPlayer(2, 'Plunder Bomber', playerTwoStart, 'left', _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_SPRITE_SETS.plunderBomber.idleDown.data)
    ];
};
const createPlayer = (id, name, position, direction, sprite) => (Object.assign(Object.assign({ id,
    name }, position), { alive: true, direction, bombsPlaced: 0, cellsDestroyed: 0, sprite }));
const pushSnapshot = (store) => {
    store.gameHistory.push({
        players: store.players.map((player) => (Object.assign({}, player))),
        bombs: store.bombs.map((bomb) => (Object.assign({}, bomb))),
        explosions: store.activeExplosions.map((explosion) => (Object.assign(Object.assign({}, explosion), { affectedCells: explosion.affectedCells.map((cell) => (Object.assign({}, cell))), hitPlayerIds: [...explosion.hitPlayerIds] })))
    });
};
const updateGame = (store) => {
    store.frameCount++;
    (0,_rules__WEBPACK_IMPORTED_MODULE_4__.updateExplosions)(store);
    (0,_rules__WEBPACK_IMPORTED_MODULE_4__.updateBombs)(store);
    for (const player of store.players) {
        if (!player.alive)
            continue;
        if ((0,_rules__WEBPACK_IMPORTED_MODULE_4__.canPlaceBomb)(store, player) && (0,_ai__WEBPACK_IMPORTED_MODULE_3__.shouldPlaceBomb)(store, player)) {
            (0,_rules__WEBPACK_IMPORTED_MODULE_4__.placeBomb)(store, player);
        }
        (0,_ai__WEBPACK_IMPORTED_MODULE_3__.movePlayer)(store, player);
    }
    pushSnapshot(store);
};
const appendDeathAnimationSnapshots = (store) => {
    if (store.players.every((player) => player.alive))
        return;
    for (let frame = 1; frame < _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_DEATH_ANIMATION_FRAMES; frame++) {
        (0,_rules__WEBPACK_IMPORTED_MODULE_4__.updateExplosions)(store);
        pushSnapshot(store);
    }
};
const resetGameState = (store) => {
    store.frameCount = 0;
    store.nextBombId = 0;
    store.players = [];
    store.bombs = [];
    store.activeExplosions = [];
    store.gameHistory = [];
    store.cellEvents = [];
    store.explosionEvents = [];
};
const stopGame = (store) => __awaiter(void 0, void 0, void 0, function* () {
    clearInterval(store.gameInterval);
});
const startGame = (store) => __awaiter(void 0, void 0, void 0, function* () {
    resetGameState(store);
    store.grid = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.createGridFromData(store);
    store.initialColors = store.grid.map((col) => col.map((cell) => cell.color));
    placePlayers(store);
    pushSnapshot(store);
    while ((0,_rules__WEBPACK_IMPORTED_MODULE_4__.countRemainingContributions)(store) > 0 &&
        store.players.filter((player) => player.alive).length > 1 &&
        store.frameCount < _constants__WEBPACK_IMPORTED_MODULE_2__.BOMBERMAN_MAX_FRAMES) {
        updateGame(store);
    }
    appendDeathAnimationSnapshots(store);
    const svg = _renderers_svg__WEBPACK_IMPORTED_MODULE_1__.Renderer.generateAnimatedSVG(store);
    store.config.svgCallback(svg);
    if (store.config.gameStatsCallback) {
        store.config.gameStatsCallback({
            totalScore: store.cellEvents.length,
            steps: store.frameCount,
            ghostsEaten: 0
        });
    }
    store.config.gameOverCallback();
});
const Game = {
    startGame,
    stopGame
};


/***/ },

/***/ "./src/bomberman/core/pathfinding.ts"
/*!*******************************************!*\
  !*** ./src/bomberman/core/pathfinding.ts ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   canEscapeAfterPlantingBomb: () => (/* binding */ canEscapeAfterPlantingBomb),
/* harmony export */   canEscapeAfterPlantingBombAt: () => (/* binding */ canEscapeAfterPlantingBombAt),
/* harmony export */   estimateFastestRoute: () => (/* binding */ estimateFastestRoute),
/* harmony export */   findEscapeStep: () => (/* binding */ findEscapeStep),
/* harmony export */   findPathToTarget: () => (/* binding */ findPathToTarget),
/* harmony export */   findReachableBombOrigins: () => (/* binding */ findReachableBombOrigins),
/* harmony export */   getPreviousPlayerPosition: () => (/* binding */ getPreviousPlayerPosition),
/* harmony export */   isBacktrackingStep: () => (/* binding */ isBacktrackingStep),
/* harmony export */   sortPathOptions: () => (/* binding */ sortPathOptions)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/bomberman/core/constants.ts");
/* harmony import */ var _rules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rules */ "./src/bomberman/core/rules.ts");



const getPreviousPlayerPosition = (store, playerId) => {
    const previousFrame = store.gameHistory[store.gameHistory.length - 2];
    const previousPlayer = previousFrame === null || previousFrame === void 0 ? void 0 : previousFrame.players.find((candidate) => candidate.id === playerId);
    return previousPlayer ? { x: previousPlayer.x, y: previousPlayer.y } : null;
};
const isBacktrackingStep = (store, player, next) => {
    const previousPosition = getPreviousPlayerPosition(store, player.id);
    return Boolean(previousPosition && (0,_rules__WEBPACK_IMPORTED_MODULE_1__.samePosition)(previousPosition, next));
};
const sortPathOptions = (positions, options) => positions.sort((a, b) => {
    const aBacktracks = options.avoidFirstStep && (0,_rules__WEBPACK_IMPORTED_MODULE_1__.samePosition)(a, options.avoidFirstStep) ? 1 : 0;
    const bBacktracks = options.avoidFirstStep && (0,_rules__WEBPACK_IMPORTED_MODULE_1__.samePosition)(b, options.avoidFirstStep) ? 1 : 0;
    if (aBacktracks !== bBacktracks)
        return aBacktracks - bBacktracks;
    if (options.target)
        return (0,_rules__WEBPACK_IMPORTED_MODULE_1__.manhattan)(a, options.target) - (0,_rules__WEBPACK_IMPORTED_MODULE_1__.manhattan)(b, options.target);
    return 0;
});
const findPathToTarget = (store, start, isTarget, options = {}) => {
    var _a;
    const visited = new Set([(0,_rules__WEBPACK_IMPORTED_MODULE_1__.positionKey)(start)]);
    const queue = [
        { position: start, firstStep: null, distance: 0 }
    ];
    while (queue.length > 0) {
        const current = queue.shift();
        if (!current)
            break;
        if (current.firstStep && isTarget(current.position)) {
            return {
                firstStep: current.firstStep,
                distance: current.distance
            };
        }
        const nextPositions = sortPathOptions((0,_rules__WEBPACK_IMPORTED_MODULE_1__.getAdjacentPositions)(current.position), current.firstStep ? { target: options.target } : options);
        for (const next of nextPositions) {
            const key = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.positionKey)(next);
            if (visited.has(key) || !(0,_rules__WEBPACK_IMPORTED_MODULE_1__.isPassableCell)(store, next))
                continue;
            visited.add(key);
            queue.push({
                position: next,
                firstStep: (_a = current.firstStep) !== null && _a !== void 0 ? _a : { x: next.x, y: next.y },
                distance: current.distance + 1
            });
        }
    }
    return null;
};
const estimateFastestRoute = (store, start, target, openedCells = new Set()) => {
    var _a;
    const queue = [{ position: start, firstStep: null, distance: 0, cost: 0, blastedCells: 0 }];
    const bestCosts = new Map([[(0,_rules__WEBPACK_IMPORTED_MODULE_1__.positionKey)(start), 0]]);
    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost || (0,_rules__WEBPACK_IMPORTED_MODULE_1__.manhattan)(a.position, target) - (0,_rules__WEBPACK_IMPORTED_MODULE_1__.manhattan)(b.position, target));
        const current = queue.shift();
        if (!current)
            break;
        if (current.firstStep && (0,_rules__WEBPACK_IMPORTED_MODULE_1__.samePosition)(current.position, target)) {
            return {
                firstStep: current.firstStep,
                distance: current.distance,
                cost: current.cost,
                blastedCells: current.blastedCells
            };
        }
        for (const next of (0,_rules__WEBPACK_IMPORTED_MODULE_1__.getAdjacentPositions)(current.position)) {
            if ((0,_rules__WEBPACK_IMPORTED_MODULE_1__.bombAt)(store, next) || (0,_rules__WEBPACK_IMPORTED_MODULE_1__.isActiveExplosionCell)(store, next))
                continue;
            const key = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.positionKey)(next);
            const opened = openedCells.has(key);
            const contribution = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.isContributionCell)(store, next) && !opened;
            const walkable = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.isEmptyCell)(store, next) || opened || contribution || (0,_rules__WEBPACK_IMPORTED_MODULE_1__.samePosition)(next, target);
            if (!walkable)
                continue;
            const stepCost = contribution ? _constants__WEBPACK_IMPORTED_MODULE_0__.BOMBERMAN_PATH_BLAST_COST : 1;
            const nextCost = current.cost + stepCost;
            const previousBest = bestCosts.get(key);
            if (previousBest !== undefined && previousBest <= nextCost)
                continue;
            bestCosts.set(key, nextCost);
            queue.push({
                position: { x: next.x, y: next.y },
                firstStep: (_a = current.firstStep) !== null && _a !== void 0 ? _a : { x: next.x, y: next.y },
                distance: current.distance + 1,
                cost: nextCost,
                blastedCells: current.blastedCells + (contribution ? 1 : 0)
            });
        }
    }
    return null;
};
const findEscapeStep = (store, player) => {
    var _a;
    const maxDepth = Math.max(_constants__WEBPACK_IMPORTED_MODULE_0__.BOMBERMAN_BOMB_FUSE_FRAMES, _constants__WEBPACK_IMPORTED_MODULE_0__.BOMBERMAN_AI.ESCAPE_MIN_SEARCH_DEPTH);
    const queue = [
        { position: player, firstStep: null, depth: 0 }
    ];
    const visited = new Set([(0,_rules__WEBPACK_IMPORTED_MODULE_1__.positionKey)(player)]);
    while (queue.length > 0) {
        const current = queue.shift();
        if (!current)
            break;
        if (current.firstStep && (0,_rules__WEBPACK_IMPORTED_MODULE_1__.isSafeStandingCell)(store, player, current.position))
            return current.firstStep;
        if (current.depth >= maxDepth)
            continue;
        const nextPositions = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.getAdjacentPositions)(current.position).sort((a, b) => {
            const aThreats = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.bombsThreateningAt)(store, a, player.id).length;
            const bThreats = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.bombsThreateningAt)(store, b, player.id).length;
            return aThreats - bThreats;
        });
        for (const next of nextPositions) {
            const key = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.positionKey)(next);
            if (visited.has(key) || !(0,_rules__WEBPACK_IMPORTED_MODULE_1__.isEmptyCell)(store, next) || (0,_rules__WEBPACK_IMPORTED_MODULE_1__.bombAt)(store, next) || (0,_rules__WEBPACK_IMPORTED_MODULE_1__.isActiveExplosionCell)(store, next, player.id))
                continue;
            const nextDepth = current.depth + 1;
            const explodesBeforeNextMove = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.bombsThreateningAt)(store, next, player.id).some((bomb) => bomb.timer <= nextDepth);
            if (explodesBeforeNextMove)
                continue;
            visited.add(key);
            queue.push({
                position: next,
                firstStep: (_a = current.firstStep) !== null && _a !== void 0 ? _a : { x: next.x, y: next.y },
                depth: nextDepth
            });
        }
    }
    return null;
};
const findReachableBombOrigins = (store, player) => {
    var _a;
    const visited = new Set([(0,_rules__WEBPACK_IMPORTED_MODULE_1__.positionKey)(player)]);
    const queue = [{ position: player, firstStep: null, distance: 0 }];
    const origins = [];
    const previousPosition = getPreviousPlayerPosition(store, player.id);
    while (queue.length > 0) {
        const current = queue.shift();
        if (!current)
            break;
        origins.push(current);
        const nextPositions = sortPathOptions((0,_rules__WEBPACK_IMPORTED_MODULE_1__.getAdjacentPositions)(current.position), current.firstStep ? { target: player } : { avoidFirstStep: previousPosition, target: player });
        for (const next of nextPositions) {
            const key = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.positionKey)(next);
            if (visited.has(key) ||
                !(0,_rules__WEBPACK_IMPORTED_MODULE_1__.isPassableCell)(store, next) ||
                (0,_rules__WEBPACK_IMPORTED_MODULE_1__.isActiveExplosionCell)(store, next, player.id) ||
                (0,_rules__WEBPACK_IMPORTED_MODULE_1__.isInOwnFutureBlast)(store, player, next)) {
                continue;
            }
            visited.add(key);
            queue.push({
                position: { x: next.x, y: next.y },
                firstStep: (_a = current.firstStep) !== null && _a !== void 0 ? _a : { x: next.x, y: next.y },
                distance: current.distance + 1
            });
        }
    }
    return origins;
};
const canEscapeAfterPlantingBombAt = (store, player, position) => {
    if (!(0,_rules__WEBPACK_IMPORTED_MODULE_1__.isEmptyCell)(store, position) || (0,_rules__WEBPACK_IMPORTED_MODULE_1__.bombAt)(store, position))
        return false;
    const virtualBomb = {
        id: -1,
        ownerId: player.id,
        x: position.x,
        y: position.y,
        timer: _constants__WEBPACK_IMPORTED_MODULE_0__.BOMBERMAN_BOMB_FUSE_FRAMES,
        exploded: false,
        sprite: ''
    };
    const virtualPlayer = Object.assign(Object.assign({}, player), { x: position.x, y: position.y });
    store.bombs.push(virtualBomb);
    try {
        return Boolean(findEscapeStep(store, virtualPlayer));
    }
    finally {
        store.bombs.pop();
    }
};
const canEscapeAfterPlantingBomb = (store, player) => {
    return canEscapeAfterPlantingBombAt(store, player, player);
};


/***/ },

/***/ "./src/bomberman/core/rules.ts"
/*!*************************************!*\
  !*** ./src/bomberman/core/rules.ts ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DIRECTIONS: () => (/* binding */ DIRECTIONS),
/* harmony export */   bombAt: () => (/* binding */ bombAt),
/* harmony export */   bombWouldHitContribution: () => (/* binding */ bombWouldHitContribution),
/* harmony export */   bombWouldHitOpponent: () => (/* binding */ bombWouldHitOpponent),
/* harmony export */   bombWouldHitTarget: () => (/* binding */ bombWouldHitTarget),
/* harmony export */   bombsThreateningAt: () => (/* binding */ bombsThreateningAt),
/* harmony export */   canPlaceBomb: () => (/* binding */ canPlaceBomb),
/* harmony export */   clearContributionCell: () => (/* binding */ clearContributionCell),
/* harmony export */   countRemainingContributions: () => (/* binding */ countRemainingContributions),
/* harmony export */   explodeBomb: () => (/* binding */ explodeBomb),
/* harmony export */   findNearestEmptyCell: () => (/* binding */ findNearestEmptyCell),
/* harmony export */   getAdjacentPositions: () => (/* binding */ getAdjacentPositions),
/* harmony export */   getBlastCells: () => (/* binding */ getBlastCells),
/* harmony export */   inBounds: () => (/* binding */ inBounds),
/* harmony export */   isActiveExplosionCell: () => (/* binding */ isActiveExplosionCell),
/* harmony export */   isContributionCell: () => (/* binding */ isContributionCell),
/* harmony export */   isEmptyCell: () => (/* binding */ isEmptyCell),
/* harmony export */   isInOwnFutureBlast: () => (/* binding */ isInOwnFutureBlast),
/* harmony export */   isPassableCell: () => (/* binding */ isPassableCell),
/* harmony export */   isSafeStandingCell: () => (/* binding */ isSafeStandingCell),
/* harmony export */   manhattan: () => (/* binding */ manhattan),
/* harmony export */   placeBomb: () => (/* binding */ placeBomb),
/* harmony export */   positionKey: () => (/* binding */ positionKey),
/* harmony export */   samePosition: () => (/* binding */ samePosition),
/* harmony export */   updateBombs: () => (/* binding */ updateBombs),
/* harmony export */   updateExplosions: () => (/* binding */ updateExplosions)
/* harmony export */ });
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./src/bomberman/core/constants.ts");


const DIRECTIONS = [
    { x: 0, y: -1, direction: 'up' },
    { x: 0, y: 1, direction: 'down' },
    { x: -1, y: 0, direction: 'left' },
    { x: 1, y: 0, direction: 'right' }
];
const positionKey = ({ x, y }) => `${x}:${y}`;
const samePosition = (a, b) => a.x === b.x && a.y === b.y;
const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const inBounds = ({ x, y }) => x >= 0 && x < _constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH && y >= 0 && y < _constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT;
const isContributionCell = (store, { x, y }) => inBounds({ x, y }) && store.grid[x][y].commitsCount > 0;
const isEmptyCell = (store, { x, y }) => inBounds({ x, y }) && store.grid[x][y].commitsCount === 0;
const bombAt = (store, { x, y }) => store.bombs.find((bomb) => !bomb.exploded && bomb.x === x && bomb.y === y);
const isPassableCell = (store, position) => isEmptyCell(store, position) && !bombAt(store, position);
const getBlastCells = (position) => [
    position,
    ...DIRECTIONS.map((direction) => ({
        x: position.x + direction.x * _constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_BLAST_RANGE,
        y: position.y + direction.y * _constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_BLAST_RANGE
    })).filter(inBounds)
];
const isActiveExplosionCell = (store, position, ownerId) => store.activeExplosions.some((explosion) => (ownerId === undefined || explosion.ownerId === ownerId) && explosion.affectedCells.some((cell) => samePosition(cell, position)));
const bombsThreateningAt = (store, position, ownerId) => store.bombs.filter((bomb) => !bomb.exploded &&
    (ownerId === undefined || bomb.ownerId === ownerId) &&
    getBlastCells(bomb).some((cell) => samePosition(cell, position)));
const isInOwnFutureBlast = (store, player, position) => bombsThreateningAt(store, position, player.id).length > 0;
const isSafeStandingCell = (store, player, position) => isEmptyCell(store, position) &&
    !bombAt(store, position) &&
    !isActiveExplosionCell(store, position, player.id) &&
    !isInOwnFutureBlast(store, player, position);
const getAdjacentPositions = ({ x, y }) => DIRECTIONS.map((delta) => ({
    x: x + delta.x,
    y: y + delta.y,
    direction: delta.direction
})).filter(inBounds);
const countRemainingContributions = (store) => store.grid.reduce((sum, col) => sum + col.filter((cell) => cell.commitsCount > 0).length, 0);
const findNearestEmptyCell = (store, origin, blocked = new Set()) => {
    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let x = 0; x < _constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH; x++) {
        for (let y = 0; y < _constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT; y++) {
            const position = { x, y };
            if (!isEmptyCell(store, position) || blocked.has(positionKey(position)))
                continue;
            const distance = Math.abs(origin.x - x) + Math.abs(origin.y - y);
            if (distance < bestDistance) {
                best = position;
                bestDistance = distance;
            }
        }
    }
    return best !== null && best !== void 0 ? best : origin;
};
const canPlaceBomb = (store, player) => player.alive &&
    isEmptyCell(store, player) &&
    !bombAt(store, player) &&
    !store.bombs.some((bomb) => !bomb.exploded && bomb.ownerId === player.id);
const bombWouldHitContribution = (store, position) => getBlastCells(position).some((cell) => isContributionCell(store, cell));
const bombWouldHitOpponent = (store, player) => {
    const opponent = store.players.find((candidate) => candidate.id !== player.id && candidate.alive);
    return Boolean(opponent && getBlastCells(player).some((cell) => samePosition(cell, opponent)));
};
const bombWouldHitTarget = (store, player) => bombWouldHitContribution(store, player) || bombWouldHitOpponent(store, player);
const placeBomb = (store, player) => {
    if (!canPlaceBomb(store, player))
        return;
    store.bombs.push({
        id: store.nextBombId++,
        ownerId: player.id,
        x: player.x,
        y: player.y,
        timer: _constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_BOMB_FUSE_FRAMES,
        exploded: false,
        sprite: _constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.explosions.bombs.fuse0.data
    });
    player.bombsPlaced++;
};
const clearContributionCell = (store, position, ownerId) => {
    if (!isContributionCell(store, position))
        return false;
    const theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getCurrentTheme(store);
    store.grid[position.x][position.y] = {
        commitsCount: 0,
        level: 'NONE',
        color: theme.intensityColors[0]
    };
    const owner = store.players.find((player) => player.id === ownerId);
    if (owner)
        owner.cellsDestroyed++;
    store.cellEvents.push({
        frameIndex: store.gameHistory.length,
        x: position.x,
        y: position.y,
        color: theme.intensityColors[0]
    });
    store.config.pointsIncreasedCallback(store.cellEvents.length);
    return true;
};
const explodeBomb = (store, bomb) => {
    if (bomb.exploded)
        return;
    bomb.exploded = true;
    const affectedCells = [{ x: bomb.x, y: bomb.y }];
    const hitPlayerIds = [];
    for (const direction of DIRECTIONS) {
        const position = {
            x: bomb.x + direction.x * _constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_BLAST_RANGE,
            y: bomb.y + direction.y * _constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_BLAST_RANGE
        };
        if (!inBounds(position))
            continue;
        affectedCells.push(position);
        clearContributionCell(store, position, bomb.ownerId);
        const chainedBomb = bombAt(store, position);
        if (chainedBomb)
            explodeBomb(store, chainedBomb);
    }
    for (const player of store.players) {
        if (!player.alive)
            continue;
        if (!affectedCells.some((position) => position.x === player.x && position.y === player.y))
            continue;
        player.alive = false;
        hitPlayerIds.push(player.id);
    }
    const explosion = {
        bombId: bomb.id,
        ownerId: bomb.ownerId,
        x: bomb.x,
        y: bomb.y,
        remainingFrames: _constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_EXPLOSION_DURATION_FRAMES,
        affectedCells,
        hitPlayerIds,
        sprite: _constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.explosions.bombs.blastCenter.data
    };
    store.activeExplosions.push(explosion);
    store.explosionEvents.push(Object.assign({ frameIndex: store.gameHistory.length }, explosion));
};
const updateBombs = (store) => {
    for (const bomb of store.bombs) {
        if (!bomb.exploded)
            bomb.timer--;
    }
    for (const bomb of [...store.bombs]) {
        if (!bomb.exploded && bomb.timer <= 0)
            explodeBomb(store, bomb);
    }
    store.bombs = store.bombs.filter((bomb) => !bomb.exploded);
};
const updateExplosions = (store) => {
    for (const explosion of store.activeExplosions) {
        explosion.remainingFrames--;
    }
    store.activeExplosions = store.activeExplosions.filter((explosion) => explosion.remainingFrames > 0);
};


/***/ },

/***/ "./src/bomberman/core/store.ts"
/*!*************************************!*\
  !*** ./src/bomberman/core/store.ts ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Store: () => (/* binding */ Store)
/* harmony export */ });
const Store = {
    frameCount: 0,
    contributions: [],
    grid: [],
    monthLabels: [],
    gameInterval: 0,
    nextBombId: 0,
    players: [],
    bombs: [],
    activeExplosions: [],
    gameHistory: [],
    initialColors: [],
    cellEvents: [],
    explosionEvents: [],
    config: undefined
};


/***/ },

/***/ "./src/bomberman/index.ts"
/*!********************************!*\
  !*** ./src/bomberman/index.ts ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BombermanRenderer: () => (/* binding */ BombermanRenderer)
/* harmony export */ });
/* harmony import */ var _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shared/providers/providers */ "./src/shared/providers/providers.ts");
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _core_game__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/game */ "./src/bomberman/core/game.ts");
/* harmony import */ var _core_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/store */ "./src/bomberman/core/store.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




class BombermanRenderer {
    constructor(conf) {
        this.conf = Object.assign({}, conf);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultConfig = {
                platform: 'github',
                username: '',
                svgCallback: (_) => { },
                gameOverCallback: () => { },
                gameTheme: 'github',
                pointsIncreasedCallback: (_) => { },
                githubSettings: { accessToken: '' }
            };
            this.store = JSON.parse(JSON.stringify(_core_store__WEBPACK_IMPORTED_MODULE_3__.Store));
            this.store.config = Object.assign(Object.assign({}, defaultConfig), this.conf);
            switch (this.store.config.platform) {
                case 'gitlab':
                    this.store.contributions = yield _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__.Providers.fetchGitlabContributions(this.store);
                    break;
                case 'github':
                    this.store.contributions = yield _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__.Providers.fetchGithubContributions(this.store);
                    break;
                default:
                    throw new Error(`Unsupported platform: ${this.store.config.platform}`);
            }
            _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.buildGrid(this.store);
            _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.buildMonthLabels(this.store);
            yield _core_game__WEBPACK_IMPORTED_MODULE_2__.Game.startGame(this.store);
            return this.store;
        });
    }
    stop() {
        _core_game__WEBPACK_IMPORTED_MODULE_2__.Game.stopGame(this.store);
    }
}


/***/ },

/***/ "./src/bomberman/renderers/animation.ts"
/*!**********************************************!*\
  !*** ./src/bomberman/renderers/animation.ts ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   appendFinalKeyframe: () => (/* binding */ appendFinalKeyframe),
/* harmony export */   appendKeyframe: () => (/* binding */ appendKeyframe),
/* harmony export */   buildChangingValuesAnimation: () => (/* binding */ buildChangingValuesAnimation),
/* harmony export */   buildStepwiseLinearAnimation: () => (/* binding */ buildStepwiseLinearAnimation),
/* harmony export */   frameToKeyTime: () => (/* binding */ frameToKeyTime)
/* harmony export */ });
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/constants */ "./src/bomberman/core/constants.ts");

const buildChangingValuesAnimation = (values) => {
    const totalFrames = values.length;
    if (totalFrames <= 1)
        return null;
    const keyTimes = [];
    const keyValues = [];
    let lastValue = null;
    values.forEach((currentValue, index) => {
        if (currentValue === lastValue)
            return;
        appendKeyframe(keyTimes, keyValues, frameToKeyTime(index, totalFrames), currentValue);
        lastValue = currentValue;
    });
    if (keyTimes.length === 0)
        return null;
    appendFinalKeyframe(keyTimes, keyValues);
    if (keyValues.length <= 1 || keyValues.every((value) => value === keyValues[0]))
        return null;
    return {
        keyTimes: keyTimes.join(';'),
        values: keyValues.join(';')
    };
};
const buildStepwiseLinearAnimation = (values) => {
    const totalFrames = values.length;
    if (totalFrames <= 1)
        return null;
    const keyTimes = [];
    const keyValues = [];
    let lastValue = null;
    let lastChangeIndex = null;
    values.forEach((currentValue, index) => {
        if (currentValue === lastValue)
            return;
        if (lastValue !== null && lastChangeIndex !== null && index - 1 !== lastChangeIndex) {
            appendKeyframe(keyTimes, keyValues, frameToKeyTime(index - 1, totalFrames), lastValue);
        }
        appendKeyframe(keyTimes, keyValues, frameToKeyTime(index, totalFrames), currentValue);
        lastValue = currentValue;
        lastChangeIndex = index;
    });
    appendFinalKeyframe(keyTimes, keyValues);
    if (keyValues.length <= 1 || keyValues.every((value) => value === keyValues[0]))
        return null;
    return {
        keyTimes: keyTimes.join(';'),
        values: keyValues.join(';')
    };
};
const appendKeyframe = (keyTimes, values, time, value) => {
    if (time === keyTimes[keyTimes.length - 1]) {
        values[values.length - 1] = value;
        return;
    }
    keyTimes.push(time);
    values.push(value);
};
const appendFinalKeyframe = (keyTimes, values) => {
    if (keyTimes[keyTimes.length - 1] !== 1) {
        keyTimes.push(1);
        values.push(values[values.length - 1]);
    }
};
const frameToKeyTime = (frameIndex, totalFrames) => Number((Math.min(frameIndex, Math.max(totalFrames - 1, 1)) / Math.max(totalFrames - 1, 1)).toFixed(_core_constants__WEBPACK_IMPORTED_MODULE_0__.BOMBERMAN_SVG.PRECISION));


/***/ },

/***/ "./src/bomberman/renderers/svg.ts"
/*!****************************************!*\
  !*** ./src/bomberman/renderers/svg.ts ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Renderer: () => (/* binding */ Renderer)
/* harmony export */ });
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/constants */ "./src/bomberman/core/constants.ts");
/* harmony import */ var _animation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./animation */ "./src/bomberman/renderers/animation.ts");



const EXPLOSION_SPRITE_SIZE = _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE * _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.EXPLOSION_SPRITE_CELL_SPAN + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE * _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.EXPLOSION_SPRITE_GAP_SPAN;
const PLAYER_SPRITE_CHAINS = {
    1: {
        down: [
            { id: 'bm-player-1-down-0', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkDown0 },
            { id: 'bm-player-1-down-1', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkDown1 },
            { id: 'bm-player-1-down-2', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkDown2 },
            { id: 'bm-player-1-down-3', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkDown3 }
        ],
        up: [
            { id: 'bm-player-1-up-0', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkUp0 },
            { id: 'bm-player-1-up-1', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkUp1 },
            { id: 'bm-player-1-up-2', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkUp2 },
            { id: 'bm-player-1-up-3', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkUp3 }
        ],
        left: [
            { id: 'bm-player-1-left-0', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight0, flipX: true },
            { id: 'bm-player-1-left-1', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight1, flipX: true },
            { id: 'bm-player-1-left-2', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight2, flipX: true },
            { id: 'bm-player-1-left-3', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight3, flipX: true },
            { id: 'bm-player-1-left-4', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight4, flipX: true },
            { id: 'bm-player-1-left-5', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight5, flipX: true }
        ],
        right: [
            { id: 'bm-player-1-right-0', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight0 },
            { id: 'bm-player-1-right-1', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight1 },
            { id: 'bm-player-1-right-2', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight2 },
            { id: 'bm-player-1-right-3', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight3 },
            { id: 'bm-player-1-right-4', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight4 },
            { id: 'bm-player-1-right-5', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.walkRight5 }
        ]
    },
    2: {
        down: [
            { id: 'bm-player-2-down-0', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkDown0 },
            { id: 'bm-player-2-down-1', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkDown1 },
            { id: 'bm-player-2-down-2', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkDown2 },
            { id: 'bm-player-2-down-3', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkDown3 }
        ],
        up: [
            { id: 'bm-player-2-up-0', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkUp0 },
            { id: 'bm-player-2-up-1', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkUp1 },
            { id: 'bm-player-2-up-2', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkUp2 },
            { id: 'bm-player-2-up-3', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkUp3 }
        ],
        left: [
            { id: 'bm-player-2-left-0', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight0, flipX: true },
            { id: 'bm-player-2-left-1', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight1, flipX: true },
            { id: 'bm-player-2-left-2', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight2, flipX: true },
            { id: 'bm-player-2-left-3', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight3, flipX: true },
            { id: 'bm-player-2-left-4', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight4, flipX: true },
            { id: 'bm-player-2-left-5', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight5, flipX: true }
        ],
        right: [
            { id: 'bm-player-2-right-0', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight0 },
            { id: 'bm-player-2-right-1', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight1 },
            { id: 'bm-player-2-right-2', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight2 },
            { id: 'bm-player-2-right-3', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight3 },
            { id: 'bm-player-2-right-4', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight4 },
            { id: 'bm-player-2-right-5', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.walkRight5 }
        ]
    }
};
const PLAYER_DEATH_SPRITE_CHAINS = {
    1: [
        { id: 'bm-player-1-death-0', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.death0 },
        { id: 'bm-player-1-death-1', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.death1 },
        { id: 'bm-player-1-death-2', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.death2 },
        { id: 'bm-player-1-death-3', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.death3 },
        { id: 'bm-player-1-death-4', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.player.death4 }
    ],
    2: [
        { id: 'bm-player-2-death-0', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.death0 },
        { id: 'bm-player-2-death-1', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.death1 },
        { id: 'bm-player-2-death-2', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.death2 },
        { id: 'bm-player-2-death-3', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.plunderBomber.death3 }
    ]
};
const BOMB_SPRITE = { id: 'bm-bomb', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.explosions.bombs.fuse0 };
const EXPLOSION_SPRITE_CHAIN = [
    { id: 'bm-explosion-thin-left', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.explosions.crosses.thinLeft },
    { id: 'bm-explosion-full-left', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.explosions.crosses.fullLeft },
    { id: 'bm-explosion-full-right', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.explosions.crosses.fullRight },
    { id: 'bm-explosion-thin-right', frame: _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SPRITE_SETS.explosions.crosses.thinRight }
];
const toSvgX = (gx) => gx * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE);
const toSvgY = (gy) => gy * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.HEADER_HEIGHT;
const generateAnimatedSVG = (store) => {
    var _a, _b, _c, _d, _e;
    const svgWidth = _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE);
    const svgHeight = _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.HEADER_HEIGHT;
    const totalFrames = store.gameHistory.length;
    const totalDurationMs = Math.max((totalFrames * _core_constants__WEBPACK_IMPORTED_MODULE_1__.DELTA_TIME) / _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.DURATION_SPEED_DIVISOR, _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.MIN_DURATION_MS);
    const theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getCurrentTheme(store);
    const cellEventsByPosition = indexCellEvents(store.cellEvents);
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" color-interpolation="sRGB">`;
    svg += `<style>image { image-rendering: pixelated; image-rendering: -moz-crisp-edges; }</style>`;
    svg += buildSpriteDefs();
    svg += `<rect width="100%" height="100%" fill="${theme.gridBackground}"/>`;
    let lastMonth = '';
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH; x++) {
        if (store.monthLabels[x] !== lastMonth) {
            const xPos = x * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2;
            svg += `<text x="${xPos}" y="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.MONTH_LABEL_Y}" text-anchor="middle" font-size="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.MONTH_LABEL_FONT_SIZE}" fill="${theme.textColor}">${store.monthLabels[x]}</text>`;
            lastMonth = store.monthLabels[x];
        }
    }
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH; x++) {
        for (let y = 0; y < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT; y++) {
            const colorAnim = getCellAnimationData(store, x, y, cellEventsByPosition);
            svg += `<rect id="c-${x}-${y}" x="${toSvgX(x)}" y="${toSvgY(y)}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE}" rx="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.CELL_RADIUS}" fill="${(_b = (_a = store.initialColors[x]) === null || _a === void 0 ? void 0 : _a[y]) !== null && _b !== void 0 ? _b : theme.intensityColors[0]}">`;
            if (colorAnim) {
                svg += `<animate attributeName="fill" calcMode="discrete" dur="${totalDurationMs}ms" repeatCount="indefinite"
					values="${colorAnim.values}" keyTimes="${colorAnim.keyTimes}"/>`;
            }
            svg += `</rect>`;
        }
    }
    for (const bombEvent of collectBombs(store)) {
        const opacityAnim = buildVisibilityAnimation(totalFrames, bombEvent.startFrame, bombEvent.endFrameExclusive);
        const initialOpacity = bombEvent.startFrame === 0 ? '1' : '0';
        svg += `<g id="bomb-${bombEvent.bomb.id}" opacity="${initialOpacity}" transform="translate(${centerPosition(bombEvent.bomb.x, bombEvent.bomb.y)})" style="will-change: opacity;">`;
        if (opacityAnim) {
            svg += `<animate attributeName="opacity" calcMode="discrete" dur="${totalDurationMs}ms" repeatCount="indefinite"
				keyTimes="${opacityAnim.keyTimes}" values="${opacityAnim.values}"/>`;
        }
        svg += `<use x="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.BOMB_X}" y="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.BOMB_Y}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.BOMB_WIDTH}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.BOMB_HEIGHT}" href="${getDefaultBombRef()}" style="will-change: transform;">
			<animateTransform attributeName="transform" type="scale" calcMode="linear" dur="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.BOMB_PULSE_DURATION_MS}ms" repeatCount="indefinite"
				keyTimes="0;0.5;1" values="1;${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.BOMB_PULSE_SCALE};1"/>
		</use></g>`;
    }
    for (const explosion of store.explosionEvents) {
        const opacityAnim = getExplosionOpacityAnimation(store, explosion);
        const spriteAnim = getExplosionSpriteAnimation(store, explosion);
        const cx = toSvgX(explosion.x) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2;
        const cy = toSvgY(explosion.y) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2;
        const x = cx - EXPLOSION_SPRITE_SIZE / 2;
        const y = cy - EXPLOSION_SPRITE_SIZE / 2;
        svg += `<use x="${x}" y="${y}" width="${EXPLOSION_SPRITE_SIZE}" height="${EXPLOSION_SPRITE_SIZE}" href="${getDefaultExplosionRef()}" opacity="0" style="will-change: opacity;">`;
        if (spriteAnim) {
            svg += `<animate attributeName="href" calcMode="discrete" dur="${totalDurationMs}ms" repeatCount="indefinite"
				keyTimes="${spriteAnim.keyTimes}" values="${spriteAnim.values}"/>`;
        }
        if (opacityAnim) {
            svg += `<animate attributeName="opacity" calcMode="discrete" dur="${totalDurationMs}ms" repeatCount="indefinite"
				keyTimes="${opacityAnim.keyTimes}" values="${opacityAnim.values}"/>`;
        }
        svg += `</use>`;
    }
    for (const player of store.players) {
        const positions = getPlayerPositions(store, player.id);
        const opacities = getPlayerOpacities(store, player.id);
        const spriteRefs = getPlayerSpriteRefs(store, player.id);
        const positionAnim = (0,_animation__WEBPACK_IMPORTED_MODULE_2__.buildStepwiseLinearAnimation)(positions);
        const opacityAnim = (0,_animation__WEBPACK_IMPORTED_MODULE_2__.buildChangingValuesAnimation)(opacities);
        const spriteAnim = (0,_animation__WEBPACK_IMPORTED_MODULE_2__.buildChangingValuesAnimation)(spriteRefs);
        svg += `<use id="player-${player.id}" x="${-_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.PLAYER_SPRITE_WIDTH / 2}" y="${-_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.PLAYER_SPRITE_HEIGHT + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.PLAYER_SPRITE_WIDTH}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.PLAYER_SPRITE_HEIGHT}" href="${(_c = spriteRefs[0]) !== null && _c !== void 0 ? _c : getDefaultPlayerRef(player.id)}" opacity="${(_d = opacities[0]) !== null && _d !== void 0 ? _d : '0'}" transform="translate(${(_e = positions[0]) !== null && _e !== void 0 ? _e : '0 0'})" style="will-change: transform, opacity;">`;
        if (spriteAnim) {
            svg += `<animate attributeName="href" calcMode="discrete" dur="${totalDurationMs}ms" repeatCount="indefinite"
				keyTimes="${spriteAnim.keyTimes}" values="${spriteAnim.values}"/>`;
        }
        if (opacityAnim) {
            svg += `<animate attributeName="opacity" calcMode="discrete" dur="${totalDurationMs}ms" repeatCount="indefinite"
				keyTimes="${opacityAnim.keyTimes}" values="${opacityAnim.values}"/>`;
        }
        if (positionAnim) {
            svg += `<animateTransform attributeName="transform" type="translate" calcMode="linear" dur="${totalDurationMs}ms" repeatCount="indefinite"
				keyTimes="${positionAnim.keyTimes}" values="${positionAnim.values}"/>`;
        }
        svg += `</use>`;
    }
    svg += '</svg>';
    return svg;
};
const getCellAnimationData = (store, x, y, eventsByPosition) => {
    var _a, _b;
    const totalFrames = store.gameHistory.length;
    const initialColor = (_b = (_a = store.initialColors[x]) === null || _a === void 0 ? void 0 : _a[y]) !== null && _b !== void 0 ? _b : _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getCurrentTheme(store).intensityColors[0];
    const events = eventsByPosition.get(cellEventKey(x, y));
    if (!events || events.length === 0)
        return null;
    const keyTimes = [0];
    const values = [initialColor];
    for (const event of events) {
        const time = (0,_animation__WEBPACK_IMPORTED_MODULE_2__.frameToKeyTime)(event.frameIndex, totalFrames);
        if (time !== keyTimes[keyTimes.length - 1]) {
            keyTimes.push(time);
            values.push(event.color);
        }
        else {
            values[values.length - 1] = event.color;
        }
    }
    if (keyTimes[keyTimes.length - 1] !== 1) {
        keyTimes.push(1);
        values.push(values[values.length - 1]);
    }
    if (values.length <= 1 || values.every((v) => v === values[0]))
        return null;
    return { keyTimes: keyTimes.join(';'), values: values.join(';') };
};
const collectBombs = (store) => {
    const bombs = new Map();
    for (let frameIndex = 0; frameIndex < store.gameHistory.length; frameIndex++) {
        const frame = store.gameHistory[frameIndex];
        for (const bomb of frame.bombs) {
            const existing = bombs.get(bomb.id);
            if (existing) {
                existing.endFrameExclusive = frameIndex + 1;
            }
            else {
                bombs.set(bomb.id, {
                    bomb,
                    startFrame: frameIndex,
                    endFrameExclusive: frameIndex + 1
                });
            }
        }
    }
    return Array.from(bombs.values());
};
const getPlayerPositions = (store, playerId) => store.gameHistory.map((frame) => {
    const player = frame.players.find((candidate) => candidate.id === playerId);
    return player ? centerPosition(player.x, player.y) : '0 0';
});
const getPlayerSpriteRefs = (store, playerId) => store.gameHistory.map((frame, frameIndex) => {
    const player = frame.players.find((candidate) => candidate.id === playerId);
    if (!player)
        return getDefaultPlayerRef(playerId);
    if (!player.alive) {
        const deathFrameIndex = getPlayerDeathFrameIndex(store, playerId);
        if (deathFrameIndex !== null) {
            const chain = PLAYER_DEATH_SPRITE_CHAINS[playerId];
            const spriteIndex = Math.min(Math.max(frameIndex - deathFrameIndex, 0), chain.length - 1);
            return toSpriteRef(chain[spriteIndex]);
        }
    }
    const previousPlayer = frameIndex > 0 ? store.gameHistory[frameIndex - 1].players.find((candidate) => candidate.id === playerId) : undefined;
    const moving = Boolean(previousPlayer && (previousPlayer.x !== player.x || previousPlayer.y !== player.y));
    const cycle = PLAYER_SPRITE_CHAINS[playerId][player.direction];
    const spriteIndex = moving ? Math.floor(frameIndex / _core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.PLAYER_SPRITE_FRAME_INTERVAL) % cycle.length : 0;
    return toSpriteRef(cycle[spriteIndex]);
});
const getPlayerOpacities = (store, playerId) => store.gameHistory.map((frame, frameIndex) => {
    const player = frame.players.find((candidate) => candidate.id === playerId);
    if (!player)
        return '0';
    if (player.alive)
        return '1';
    const deathFrameIndex = getPlayerDeathFrameIndex(store, playerId);
    if (deathFrameIndex === null)
        return '0';
    const deathFrame = frameIndex - deathFrameIndex;
    return deathFrame >= 0 && deathFrame < PLAYER_DEATH_SPRITE_CHAINS[playerId].length ? '1' : '0';
});
const getPlayerDeathFrameIndex = (store, playerId) => {
    for (let frameIndex = 1; frameIndex < store.gameHistory.length; frameIndex++) {
        const previousPlayer = store.gameHistory[frameIndex - 1].players.find((candidate) => candidate.id === playerId);
        const currentPlayer = store.gameHistory[frameIndex].players.find((candidate) => candidate.id === playerId);
        if ((previousPlayer === null || previousPlayer === void 0 ? void 0 : previousPlayer.alive) && currentPlayer && !currentPlayer.alive)
            return frameIndex;
    }
    return null;
};
const centerPosition = (x, y) => `${toSvgX(x) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2} ${toSvgY(y) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2}`;
const getExplosionSpriteAnimation = (store, explosion) => {
    const totalFrames = store.gameHistory.length;
    const keyTimes = [0];
    const values = [getDefaultExplosionRef()];
    const visibleFrames = Math.max(explosion.remainingFrames, 1);
    for (let localFrame = 0; localFrame < visibleFrames; localFrame++) {
        const frameIndex = explosion.frameIndex + localFrame;
        const time = (0,_animation__WEBPACK_IMPORTED_MODULE_2__.frameToKeyTime)(frameIndex, totalFrames);
        const spriteIndex = Math.min(localFrame, EXPLOSION_SPRITE_CHAIN.length - 1);
        (0,_animation__WEBPACK_IMPORTED_MODULE_2__.appendKeyframe)(keyTimes, values, time, toSpriteRef(EXPLOSION_SPRITE_CHAIN[spriteIndex]));
    }
    (0,_animation__WEBPACK_IMPORTED_MODULE_2__.appendFinalKeyframe)(keyTimes, values);
    if (values.length <= 1 || values.every((v) => v === values[0]))
        return null;
    return { keyTimes: keyTimes.join(';'), values: values.join(';') };
};
const getExplosionOpacityAnimation = (store, explosion) => {
    const totalFrames = store.gameHistory.length;
    const start = (0,_animation__WEBPACK_IMPORTED_MODULE_2__.frameToKeyTime)(explosion.frameIndex, totalFrames);
    const end = (0,_animation__WEBPACK_IMPORTED_MODULE_2__.frameToKeyTime)(explosion.frameIndex + explosion.remainingFrames, totalFrames);
    return {
        keyTimes: `0;${start};${start};${end};${end};1`,
        values: `0;0;${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.EXPLOSION_OPACITY};${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BOMBERMAN_SVG.EXPLOSION_OPACITY};0;0`
    };
};
const buildVisibilityAnimation = (totalFrames, startFrame, endFrameExclusive) => {
    if (totalFrames <= 1 || (startFrame === 0 && endFrameExclusive >= totalFrames))
        return null;
    const start = (0,_animation__WEBPACK_IMPORTED_MODULE_2__.frameToKeyTime)(startFrame, totalFrames);
    const end = (0,_animation__WEBPACK_IMPORTED_MODULE_2__.frameToKeyTime)(endFrameExclusive, totalFrames);
    return {
        keyTimes: `0;${start};${start};${end};${end};1`,
        values: '0;0;1;1;0;0'
    };
};
const indexCellEvents = (events) => {
    const eventsByPosition = new Map();
    for (const event of events) {
        const key = cellEventKey(event.x, event.y);
        const cellEvents = eventsByPosition.get(key);
        if (cellEvents) {
            cellEvents.push(event);
        }
        else {
            eventsByPosition.set(key, [event]);
        }
    }
    return eventsByPosition;
};
const cellEventKey = (x, y) => `${x}:${y}`;
const buildSpriteDefs = () => {
    const symbols = new Map();
    for (const playerChains of Object.values(PLAYER_SPRITE_CHAINS)) {
        for (const cycle of Object.values(playerChains)) {
            for (const sprite of cycle)
                symbols.set(sprite.id, sprite);
        }
    }
    for (const cycle of Object.values(PLAYER_DEATH_SPRITE_CHAINS)) {
        for (const sprite of cycle)
            symbols.set(sprite.id, sprite);
    }
    symbols.set(BOMB_SPRITE.id, BOMB_SPRITE);
    for (const sprite of EXPLOSION_SPRITE_CHAIN)
        symbols.set(sprite.id, sprite);
    const defs = Array.from(symbols.entries())
        .map(([id, sprite]) => `<symbol id="${id}" viewBox="0 0 ${sprite.frame.width} ${sprite.frame.height}" overflow="visible">
				<image width="${sprite.frame.width}" height="${sprite.frame.height}" href="${sprite.frame.data}" preserveAspectRatio="xMidYMid meet" style="image-rendering: pixelated;"${sprite.flipX ? ` transform="translate(${sprite.frame.width} 0) scale(-1 1)"` : ''}/>
			</symbol>`)
        .join('');
    return `<defs>${defs}</defs>`;
};
const toSpriteRef = (sprite) => `#${sprite.id}`;
const getDefaultPlayerRef = (playerId) => toSpriteRef(PLAYER_SPRITE_CHAINS[playerId].down[0]);
const getDefaultBombRef = () => toSpriteRef(BOMB_SPRITE);
const getDefaultExplosionRef = () => toSpriteRef(EXPLOSION_SPRITE_CHAIN[0]);
const Renderer = {
    generateAnimatedSVG
};


/***/ },

/***/ "./src/breakout/core/constants.ts"
/*!****************************************!*\
  !*** ./src/breakout/core/constants.ts ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BALL_COLOR: () => (/* binding */ BALL_COLOR),
/* harmony export */   BALL_INITIAL_DX: () => (/* binding */ BALL_INITIAL_DX),
/* harmony export */   BALL_INITIAL_DY: () => (/* binding */ BALL_INITIAL_DY),
/* harmony export */   BALL_RADIUS: () => (/* binding */ BALL_RADIUS),
/* harmony export */   BALL_SHADOW_COLOR: () => (/* binding */ BALL_SHADOW_COLOR),
/* harmony export */   BALL_TARGETING_THRESHOLD: () => (/* binding */ BALL_TARGETING_THRESHOLD),
/* harmony export */   CELL_SIZE: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE),
/* harmony export */   DELTA_TIME: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.DELTA_TIME),
/* harmony export */   GAME_THEMES: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GAME_THEMES),
/* harmony export */   GAP_SIZE: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE),
/* harmony export */   GRID_HEIGHT: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT),
/* harmony export */   GRID_WIDTH: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH),
/* harmony export */   MAX_BOUNCE_ANGLE: () => (/* binding */ MAX_BOUNCE_ANGLE),
/* harmony export */   PADDLE_COLOR: () => (/* binding */ PADDLE_COLOR),
/* harmony export */   PADDLE_HEIGHT: () => (/* binding */ PADDLE_HEIGHT),
/* harmony export */   PADDLE_SPEED: () => (/* binding */ PADDLE_SPEED),
/* harmony export */   PADDLE_WIDTH: () => (/* binding */ PADDLE_WIDTH),
/* harmony export */   PADDLE_Y: () => (/* binding */ PADDLE_Y)
/* harmony export */ });
/* harmony import */ var _shared_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/constants */ "./src/shared/constants.ts");
/* ─── Re-export shared constants so breakout code has one import location ─── */

/* ───────────── Ball ───────────── */
/** Ball radius in grid units (slightly less than half a cell) */
const BALL_RADIUS = 0.21;
/** Initial ball speed components (grid units per frame). The ratio is
 *  intentionally irrational so the ball path is non-repeating.
 *  Keep each component < 1.0 so the ball never skips over a grid cell. */
const BALL_INITIAL_DX = 0.75;
const BALL_INITIAL_DY = -0.95;
/* ───────────── Paddle ───────────── */
/** Paddle width in grid units */
const PADDLE_WIDTH = 7;
/** Maximum horizontal distance the paddle moves per frame */
const PADDLE_SPEED = 2.0;
/** Paddle Y position in grid units (just below the last row) */
const PADDLE_Y = 7.4;
/** Paddle height in grid units */
const PADDLE_HEIGHT = 0.5;
/**
 * Maximum bounce angle (degrees from vertical) when the ball hits the paddle edge.
 * Centre hit = straight up (0°). Far edge = MAX_BOUNCE_ANGLE either side.
 */
const MAX_BOUNCE_ANGLE = 65;
/* ───────────── AI ───────────── */
/** If the ball has not hit a brick for this many frames, force-target
 *  the nearest remaining brick to avoid stalling. */
const BALL_TARGETING_THRESHOLD = 10;
/* ───────────── Visual ───────────── */
const BALL_COLOR = '#ffffff';
const PADDLE_COLOR = '#ffffff';
const BALL_SHADOW_COLOR = '#aaaaaa';


/***/ },

/***/ "./src/breakout/core/game.ts"
/*!***********************************!*\
  !*** ./src/breakout/core/game.ts ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BreakoutGame: () => (/* binding */ BreakoutGame)
/* harmony export */ });
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _renderers_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../renderers/svg */ "./src/breakout/renderers/svg.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "./src/breakout/core/constants.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/** Fraction of a grid unit occupied by the visible brick face (gap excluded). */
const CELL_RATIO = _constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE / (_constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE + _constants__WEBPACK_IMPORTED_MODULE_2__.GAP_SIZE); // ≈ 0.909
/** Ordered levels from weakest to strongest. */
const LEVEL_ORDER = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];
/** Return the level one step below the given level (minimum NONE). */
const decrementLevel = (level) => {
    const idx = LEVEL_ORDER.indexOf(level);
    return LEVEL_ORDER[Math.max(0, idx - 1)];
};
/* ────────────────── Initialise game state ────────────────── */
const placeBall = (store) => {
    store.ball = {
        x: _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH / 2,
        y: _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_Y - 1.5,
        dx: _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_INITIAL_DX,
        dy: _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_INITIAL_DY // negative = moving upward toward bricks
    };
};
const placePaddle = (store) => {
    store.paddle = {
        x: (_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_WIDTH) / 2,
        width: _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_WIDTH
    };
};
/* ────────────────── Main loop ────────────────── */
const startGame = (store) => __awaiter(void 0, void 0, void 0, function* () {
    store.frameCount = 0;
    store.framesSinceLastBrickHit = 0;
    store.gameHistory = [];
    store.brickEvents = [];
    store.grid = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.createGridFromData(store);
    // Snapshot initial colors before any bricks are hit (used by SVG renderer)
    store.initialColors = store.grid.map((col) => col.map((cell) => cell.color));
    const totalBricks = store.grid.reduce((sum, col) => sum + col.filter((c) => c.commitsCount > 0).length, 0);
    if (totalBricks === 0) {
        const svg = _renderers_svg__WEBPACK_IMPORTED_MODULE_1__.BreakoutSVG.generateAnimatedSVG(store);
        store.config.svgCallback(svg);
        store.config.gameOverCallback();
        return;
    }
    placeBall(store);
    placePaddle(store);
    store.targetBrick = pickRandomTarget(store);
    store.bouncesSinceTargetSet = 0;
    const MAX_FRAMES = 3000;
    while (store.grid.some((col) => col.some((c) => c.commitsCount > 0)) && store.frameCount < MAX_FRAMES) {
        updateGame(store);
        if (store.frameCount % 200 === 0) {
            const rem = store.grid.reduce((sum, col) => sum + col.filter((c) => c.commitsCount > 0).length, 0);
        }
    }
    const svg = _renderers_svg__WEBPACK_IMPORTED_MODULE_1__.BreakoutSVG.generateAnimatedSVG(store);
    store.config.svgCallback(svg);
    if (store.config.gameStatsCallback) {
        store.config.gameStatsCallback({
            totalScore: countBrokenBricks(store),
            steps: store.frameCount,
            ghostsEaten: 0
        });
    }
    store.config.gameOverCallback();
});
const stopGame = (_store) => { };
/* ────────────────── Per-frame update ────────────────── */
const updateGame = (store) => {
    var _a, _b;
    store.frameCount++;
    const { ball, paddle, grid } = store;
    // ── Sub-step movement ─────────────────────────────────────────────────
    // Split each frame into small steps so the ball never travels more than
    // BALL_RADIUS in a single step, preventing tunnelling through bricks.
    const speed = Math.hypot(ball.dx, ball.dy);
    const subSteps = Math.ceil(speed / _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS);
    const dt = 1 / subSteps;
    for (let s = 0; s < subSteps; s++) {
        ball.x += ball.dx * dt;
        ball.y += ball.dy * dt;
        // ── Wall collisions ────────────────────────────────────────────────
        if (ball.x - _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS <= 0) {
            ball.x = _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS;
            ball.dx = Math.abs(ball.dx);
        }
        if (ball.x + _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH) {
            ball.x = _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS;
            ball.dx = -Math.abs(ball.dx);
        }
        if (ball.y - _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS <= 0) {
            ball.y = _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS;
            ball.dy = Math.abs(ball.dy);
        }
        // ── Paddle collision ───────────────────────────────────────────────
        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_WIDTH;
        if (ball.dy > 0 &&
            ball.y + _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS >= _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_Y &&
            ball.y - _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS < _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_Y + 0.5 &&
            ball.x >= paddleLeft - _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS &&
            ball.x <= paddleRight + _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS) {
            ball.y = _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_Y - _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS;
            // Angle-based bounce: hit position on paddle maps linearly to angle.
            // Centre → straight up (0°). Far edges → ±MAX_BOUNCE_ANGLE from vertical.
            const paddleCenter = paddleLeft + _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_WIDTH / 2;
            const hitOffset = Math.max(-1, Math.min(1, (ball.x - paddleCenter) / (_constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_WIDTH / 2)));
            const speed = Math.hypot(ball.dx, ball.dy);
            const rad = hitOffset * _constants__WEBPACK_IMPORTED_MODULE_2__.MAX_BOUNCE_ANGLE * (Math.PI / 180);
            ball.dx = speed * Math.sin(rad);
            ball.dy = -speed * Math.cos(rad); // always upward
            // Count paddle bounces without hitting the current target.
            // After 5 misses, give up and pick a new random target.
            store.bouncesSinceTargetSet++;
            if (store.bouncesSinceTargetSet >= 5) {
                store.targetBrick = pickRandomTarget(store);
                store.bouncesSinceTargetSet = 0;
            }
        }
        // Safety: ball fell past the paddle
        if (ball.y > _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_Y + 1) {
            ball.x = _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH / 2;
            ball.y = _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_Y - 1.5;
            ball.dy = -Math.abs(ball.dy);
        }
        // ── Brick collision (circle-vs-AABB, edge-precise) ────────────────
        const colMin = Math.max(0, Math.floor(ball.x - _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS));
        const colMax = Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - 1, Math.floor(ball.x + _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS));
        const rowMin = Math.max(0, Math.floor(ball.y - _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS));
        const rowMax = Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT - 1, Math.floor(ball.y + _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS));
        let flipDx = false;
        let flipDy = false;
        const theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getCurrentTheme(store);
        for (let cx = colMin; cx <= colMax; cx++) {
            for (let cy = rowMin; cy <= rowMax; cy++) {
                if (grid[cx][cy].commitsCount === 0)
                    continue;
                // Nearest point on the visible brick face (gap excluded)
                const nearX = Math.max(cx, Math.min(cx + CELL_RATIO, ball.x));
                const nearY = Math.max(cy, Math.min(cy + CELL_RATIO, ball.y));
                const distSq = Math.pow((ball.x - nearX), 2) + Math.pow((ball.y - nearY), 2);
                if (distSq >= _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS * _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS)
                    continue; // no overlap
                // ── Reduce brick level by one hit ──────────────────────────
                const oldLevel = grid[cx][cy].level;
                const newLevel = decrementLevel(oldLevel);
                grid[cx][cy].level = newLevel;
                if (newLevel === 'NONE') {
                    grid[cx][cy].commitsCount = 0;
                    grid[cx][cy].color = theme.intensityColors[0];
                    // If this was the current target, pick a new one immediately
                    if (((_a = store.targetBrick) === null || _a === void 0 ? void 0 : _a.cx) === cx && ((_b = store.targetBrick) === null || _b === void 0 ? void 0 : _b.cy) === cy) {
                        store.targetBrick = pickRandomTarget(store);
                        store.bouncesSinceTargetSet = 0;
                    }
                }
                else {
                    const levelIndex = LEVEL_ORDER.indexOf(newLevel);
                    grid[cx][cy].color = theme.intensityColors[levelIndex];
                }
                // Record color-change event keyed to the upcoming gameHistory index
                store.brickEvents.push({ frameIndex: store.gameHistory.length, x: cx, y: cy, color: grid[cx][cy].color });
                // Push ball out of brick and determine bounce axis
                const penX = _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS - Math.abs(ball.x - nearX);
                const penY = _constants__WEBPACK_IMPORTED_MODULE_2__.BALL_RADIUS - Math.abs(ball.y - nearY);
                if (penX <= penY) {
                    ball.x += ball.dx < 0 ? penX : -penX;
                    flipDx = true;
                }
                else {
                    ball.y += ball.dy < 0 ? penY : -penY;
                    flipDy = true;
                }
                store.framesSinceLastBrickHit = 0;
                store.config.pointsIncreasedCallback(countBrokenBricks(store));
            }
        }
        if (flipDx)
            ball.dx = -ball.dx;
        if (flipDy)
            ball.dy = -ball.dy;
    }
    // ── Paddle AI — position to aim at the current target brick ──────────
    if (ball.dy > 0 && store.targetBrick) {
        const target = store.targetBrick;
        // Predict where the ball will cross the paddle level (accounting for wall bounces)
        const timeToLand = (_constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_Y - ball.y) / ball.dy;
        let predictedX = ball.x + ball.dx * timeToLand;
        // Fold wall reflections
        predictedX = Math.abs(((predictedX % (2 * _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH)) + 2 * _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH) % (2 * _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH));
        if (predictedX > _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH)
            predictedX = 2 * _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - predictedX;
        // Required angle to reach target from predicted landing x
        const tx = target.cx + 0.5;
        const ty = target.cy + 0.5;
        const vertDist = _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_Y - ty; // positive: target is above paddle
        const horizDist = tx - predictedX;
        const targetAngleDeg = Math.atan2(horizDist, Math.max(vertDist, 0.5)) * (180 / Math.PI);
        const clampedAngle = Math.max(-_constants__WEBPACK_IMPORTED_MODULE_2__.MAX_BOUNCE_ANGLE, Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.MAX_BOUNCE_ANGLE, targetAngleDeg));
        // Hit offset that would produce this angle
        const desiredHitOffset = clampedAngle / _constants__WEBPACK_IMPORTED_MODULE_2__.MAX_BOUNCE_ANGLE; // [-1, 1]
        // Paddle must be positioned so ball lands at the right spot
        const desiredPaddleCenter = predictedX - desiredHitOffset * (_constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_WIDTH / 2);
        const desiredPaddleX = Math.max(0, Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_WIDTH, desiredPaddleCenter - _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_WIDTH / 2));
        // Move paddle toward the desired position
        if (paddle.x < desiredPaddleX - _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_SPEED) {
            paddle.x += _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_SPEED;
        }
        else if (paddle.x > desiredPaddleX + _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_SPEED) {
            paddle.x -= _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_SPEED;
        }
        else {
            paddle.x = desiredPaddleX;
        }
    }
    else if (ball.dy > 0) {
        // No target: just track the ball so it doesn't miss
        const paddleCenter = paddle.x + _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_WIDTH / 2;
        if (paddleCenter < ball.x - 0.5)
            paddle.x = Math.min(paddle.x + _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_SPEED, _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_WIDTH);
        else if (paddleCenter > ball.x + 0.5)
            paddle.x = Math.max(paddle.x - _constants__WEBPACK_IMPORTED_MODULE_2__.PADDLE_SPEED, 0);
    }
    // ── Snapshot ───────────────────────────────────────────────────────────
    pushSnapshot(store);
};
/* ────────────────── Helpers ────────────────── */
const pushSnapshot = (store) => {
    // Only ball + paddle — brick changes are tracked separately in brickEvents
    store.gameHistory.push({
        ball: Object.assign({}, store.ball),
        paddle: Object.assign({}, store.paddle)
    });
};
const countBrokenBricks = (store) => {
    let broken = 0;
    store.grid.forEach((col) => col.forEach((cell) => {
        if (cell.commitsCount === 0)
            broken++;
    }));
    return broken;
};
/** Pick a random live brick as the AI's next target. */
const pickRandomTarget = (store) => {
    var _a, _b;
    const live = [];
    for (let cx = 0; cx < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH; cx++) {
        for (let cy = 0; cy < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT; cy++) {
            if (((_b = (_a = store.grid[cx]) === null || _a === void 0 ? void 0 : _a[cy]) === null || _b === void 0 ? void 0 : _b.commitsCount) > 0)
                live.push({ cx, cy });
        }
    }
    if (live.length === 0)
        return null;
    return live[Math.floor(Math.random() * live.length)];
};
const BreakoutGame = {
    startGame,
    stopGame
};


/***/ },

/***/ "./src/breakout/core/store.ts"
/*!************************************!*\
  !*** ./src/breakout/core/store.ts ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BreakoutStore: () => (/* binding */ BreakoutStore)
/* harmony export */ });
const BreakoutStore = {
    frameCount: 0,
    contributions: [],
    ball: { x: 0, y: 0, dx: 0, dy: 0 },
    paddle: { x: 0, width: 7 },
    grid: [],
    monthLabels: [],
    framesSinceLastBrickHit: 0,
    targetBrick: null,
    bouncesSinceTargetSet: 0,
    gameHistory: [],
    initialColors: [],
    brickEvents: [],
    config: undefined
};


/***/ },

/***/ "./src/breakout/index.ts"
/*!*******************************!*\
  !*** ./src/breakout/index.ts ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BreakoutRenderer: () => (/* binding */ BreakoutRenderer)
/* harmony export */ });
/* harmony import */ var _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shared/providers/providers */ "./src/shared/providers/providers.ts");
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _core_game__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/game */ "./src/breakout/core/game.ts");
/* harmony import */ var _core_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/store */ "./src/breakout/core/store.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




class BreakoutRenderer {
    constructor(conf) {
        this.conf = Object.assign({}, conf);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultConfig = {
                platform: 'github',
                username: '',
                svgCallback: (_) => { },
                gameOverCallback: () => { },
                gameTheme: 'github',
                pointsIncreasedCallback: (_) => { },
                githubSettings: { accessToken: '' }
            };
            this.store = JSON.parse(JSON.stringify(_core_store__WEBPACK_IMPORTED_MODULE_3__.BreakoutStore));
            this.store.config = Object.assign(Object.assign({}, defaultConfig), this.conf);
            switch (this.store.config.platform) {
                case 'gitlab':
                    this.store.contributions = yield _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__.Providers.fetchGitlabContributions(this.store);
                    break;
                case 'github':
                    this.store.contributions = yield _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__.Providers.fetchGithubContributions(this.store);
                    break;
                default:
                    throw new Error(`Unsupported platform: ${this.store.config.platform}`);
            }
            _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.buildGrid(this.store);
            _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.buildMonthLabels(this.store);
            yield _core_game__WEBPACK_IMPORTED_MODULE_2__.BreakoutGame.startGame(this.store);
            return this.store;
        });
    }
    stop() {
        _core_game__WEBPACK_IMPORTED_MODULE_2__.BreakoutGame.stopGame(this.store);
    }
}


/***/ },

/***/ "./src/breakout/renderers/svg.ts"
/*!***************************************!*\
  !*** ./src/breakout/renderers/svg.ts ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BreakoutSVG: () => (/* binding */ BreakoutSVG)
/* harmony export */ });
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/constants */ "./src/breakout/core/constants.ts");


const SVG_PRECISION = 4;
/** Convert a grid-unit x coordinate to SVG pixels */
const toSvgX = (gx) => gx * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE);
/** Convert a grid-unit y coordinate to SVG pixels (offset by month-label area) */
const toSvgY = (gy) => gy * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + 15;
const generateAnimatedSVG = (store) => {
    const svgWidth = _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE);
    // Extra height: 15px month labels + grid + 40px paddle area
    const paddleAreaHeight = 40;
    const svgHeight = _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + 15 + paddleAreaHeight;
    const totalDurationMs = (store.gameHistory.length * _core_constants__WEBPACK_IMPORTED_MODULE_1__.DELTA_TIME) / 2;
    const theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getCurrentTheme(store);
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<desc>Generated with breakout-contribution-graph on ${new Date()}</desc>`;
    svg += `<metadata>
		<info>
			<frames>${store.gameHistory.length}</frames>
			<frameRate>${1000 / _core_constants__WEBPACK_IMPORTED_MODULE_1__.DELTA_TIME}</frameRate>
			<durationMs>${totalDurationMs}</durationMs>
			<generatedOn>${new Date().toISOString()}</generatedOn>
		</info>
	</metadata>`;
    svg += `<rect width="100%" height="100%" fill="${theme.gridBackground}"/>`;
    // ── Month labels ─────────────────────────────────────────────────────
    let lastMonth = '';
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH; x++) {
        if (store.monthLabels[x] !== lastMonth) {
            const xPos = x * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2;
            svg += `<text x="${xPos}" y="10" text-anchor="middle" font-size="10" fill="${theme.textColor}">${store.monthLabels[x]}</text>`;
            lastMonth = store.monthLabels[x];
        }
    }
    // ── Grid cells (bricks) ───────────────────────────────────────────────
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH; x++) {
        for (let y = 0; y < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT; y++) {
            const cellX = toSvgX(x);
            const cellY = toSvgY(y);
            const colorAnim = getCellAnimationData(store, x, y);
            svg += `<rect id="c-${x}-${y}" x="${cellX}" y="${cellY}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE}" rx="3" fill="${theme.intensityColors[0]}">
				<animate attributeName="fill" calcMode="discrete" dur="${totalDurationMs}ms" repeatCount="indefinite"
					values="${colorAnim.values}" keyTimes="${colorAnim.keyTimes}"/>
			</rect>`;
        }
    }
    // ── Ball ──────────────────────────────────────────────────────────────
    const ballR = Math.round(_core_constants__WEBPACK_IMPORTED_MODULE_1__.BALL_RADIUS * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE));
    const ballPosAnim = buildChangingValuesAnimation(store, getBallPositions(store));
    // cx/cy are 0 so animateTransform translate values are absolute SVG coords
    svg += `<circle id="ball" cx="0" cy="0" r="${ballR}" fill="${theme.wallColor}" stroke="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BALL_SHADOW_COLOR}" stroke-width="1">
		<animateTransform attributeName="transform" type="translate"
			calcMode="linear"
			dur="${totalDurationMs}ms" repeatCount="indefinite"
			keyTimes="${ballPosAnim.keyTimes}"
			values="${ballPosAnim.values}"/>
	</circle>`;
    // ── Paddle ────────────────────────────────────────────────────────────
    const paddleSvgY = toSvgY(_core_constants__WEBPACK_IMPORTED_MODULE_1__.PADDLE_Y);
    const paddleW = Math.round(_core_constants__WEBPACK_IMPORTED_MODULE_1__.PADDLE_WIDTH * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) - _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE);
    const paddleH = Math.round(_core_constants__WEBPACK_IMPORTED_MODULE_1__.PADDLE_HEIGHT * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE));
    const paddlePosAnim = buildChangingValuesAnimation(store, getPaddlePositions(store));
    // x=0 so animateTransform translate values drive the horizontal position
    svg += `<rect id="paddle" x="0" y="${paddleSvgY}" width="${paddleW}" height="${paddleH}" rx="3" fill="${theme.wallColor}">
		<animateTransform attributeName="transform" type="translate"
			calcMode="linear"
			dur="${totalDurationMs}ms" repeatCount="indefinite"
			keyTimes="${paddlePosAnim.keyTimes}"
			values="${paddlePosAnim.values}"/>
	</rect>`;
    svg += '</svg>';
    return svg;
};
/* ────────────────── Animation helpers ────────────────── */
/**
 * Build cell color animation data directly from brickEvents.
 * Much cheaper than per-frame grid snapshots: only records actual changes.
 */
const getCellAnimationData = (store, x, y) => {
    var _a, _b;
    const totalFrames = store.gameHistory.length;
    const initialColor = (_b = (_a = store.initialColors[x]) === null || _a === void 0 ? void 0 : _a[y]) !== null && _b !== void 0 ? _b : '#ebedf0';
    const events = store.brickEvents.filter((e) => e.x === x && e.y === y);
    if (events.length === 0) {
        return { keyTimes: '0;1', values: `${initialColor};${initialColor}` };
    }
    const kTimes = [0];
    const kValues = [initialColor];
    for (const ev of events) {
        const t = Number((ev.frameIndex / Math.max(totalFrames - 1, 1)).toFixed(SVG_PRECISION));
        // Avoid duplicate keyTimes (two events in the same frame)
        if (t !== kTimes[kTimes.length - 1]) {
            kTimes.push(t);
            kValues.push(ev.color);
        }
        else {
            kValues[kValues.length - 1] = ev.color; // overwrite same-frame event
        }
    }
    if (kTimes[kTimes.length - 1] !== 1) {
        kTimes.push(1);
        kValues.push(kValues[kValues.length - 1]);
    }
    return { keyTimes: kTimes.join(';'), values: kValues.join(';') };
};
const getBallPositions = (store) => store.gameHistory.map((frame) => {
    const svgX = toSvgX(frame.ball.x);
    const svgY = toSvgY(frame.ball.y);
    return `${svgX},${svgY}`;
});
const getPaddlePositions = (store) => store.gameHistory.map((frame) => `${toSvgX(frame.paddle.x)},0`);
/**
 * Compresses an array of per-frame values into a compact SVG animation
 * (keyTimes + values), skipping redundant frames.
 */
const buildChangingValuesAnimation = (store, values) => {
    var _a, _b, _c, _d;
    const totalFrames = store.gameHistory.length;
    if (totalFrames === 0) {
        const v = (_a = values[0]) !== null && _a !== void 0 ? _a : '0,0';
        return { keyTimes: '0;1', values: `${v};${v}` };
    }
    const keyTimes = [];
    const keyValues = [];
    let lastValue = null;
    let lastIndex = null;
    values.forEach((curr, idx) => {
        if (curr !== lastValue) {
            if (lastValue !== null && lastIndex !== null && idx - 1 !== lastIndex) {
                keyTimes.push(Number(((idx - 1) / (totalFrames - 1)).toFixed(SVG_PRECISION)));
                keyValues.push(lastValue);
            }
            keyTimes.push(Number((idx / (totalFrames - 1)).toFixed(SVG_PRECISION)));
            keyValues.push(curr);
            lastValue = curr;
            lastIndex = idx;
        }
    });
    if (keyTimes.length === 0 || keyTimes[keyTimes.length - 1] !== 1) {
        if (keyTimes.length === 0) {
            keyTimes.push(0, 1);
            keyValues.push((_b = values[0]) !== null && _b !== void 0 ? _b : '0,0', (_c = values[values.length - 1]) !== null && _c !== void 0 ? _c : '0,0');
        }
        else {
            keyTimes.push(1);
            keyValues.push((_d = lastValue !== null && lastValue !== void 0 ? lastValue : values[values.length - 1]) !== null && _d !== void 0 ? _d : '0,0');
        }
    }
    return { keyTimes: keyTimes.join(';'), values: keyValues.join(';') };
};
const BreakoutSVG = { generateAnimatedSVG };


/***/ },

/***/ "./src/galaga/core/constants.ts"
/*!**************************************!*\
  !*** ./src/galaga/core/constants.ts ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BULLET_IMAGE_DATA: () => (/* binding */ BULLET_IMAGE_DATA),
/* harmony export */   BULLET_SPEED: () => (/* binding */ BULLET_SPEED),
/* harmony export */   BULLET_SPRITE_HEIGHT_GU: () => (/* binding */ BULLET_SPRITE_HEIGHT_GU),
/* harmony export */   CELL_SIZE: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE),
/* harmony export */   DELTA_TIME: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.DELTA_TIME),
/* harmony export */   EXPLOSION_FRAMES: () => (/* binding */ EXPLOSION_FRAMES),
/* harmony export */   FIRE_RATE: () => (/* binding */ FIRE_RATE),
/* harmony export */   FRAMES_PER_TARGET_MAX: () => (/* binding */ FRAMES_PER_TARGET_MAX),
/* harmony export */   FRAMES_PER_TARGET_MIN: () => (/* binding */ FRAMES_PER_TARGET_MIN),
/* harmony export */   GAME_THEMES: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GAME_THEMES),
/* harmony export */   GAP_SIZE: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE),
/* harmony export */   GRID_HEIGHT: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT),
/* harmony export */   GRID_WIDTH: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH),
/* harmony export */   MAX_BULLETS: () => (/* binding */ MAX_BULLETS),
/* harmony export */   SHIP_HALF_WIDTH: () => (/* binding */ SHIP_HALF_WIDTH),
/* harmony export */   SHIP_IMAGE_DATA: () => (/* binding */ SHIP_IMAGE_DATA),
/* harmony export */   SHIP_SPEED: () => (/* binding */ SHIP_SPEED),
/* harmony export */   SHIP_Y: () => (/* binding */ SHIP_Y)
/* harmony export */ });
/* harmony import */ var _shared_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/constants */ "./src/shared/constants.ts");
/* ─── Re-export shared constants so galaga code has one import location ─── */

/* ───────────── Ship ───────────── */
/** Ship center Y in grid units (just below the 7-row grid) */
const SHIP_Y = 10.5;
/** Ship horizontal speed in grid units per frame */
const SHIP_SPEED = 0.4;
/** Ship half-width in grid units (used for clamping) */
const SHIP_HALF_WIDTH = 0.8;
/* ───────────── Bullets ───────────── */
/** Upward speed of a bullet in grid units per frame */
const BULLET_SPEED = 0.6;
/** Maximum simultaneous active bullets */
const MAX_BULLETS = 10;
/** Fire a new bullet every this many frames when aligned with a target */
const FIRE_RATE = 2;
/** Minimum frames the ship shoots at one target before moving to the next */
const FRAMES_PER_TARGET_MIN = 4;
/** Maximum frames the ship shoots at one target before moving to the next */
const FRAMES_PER_TARGET_MAX = 8;
/** Number of frames an explosion animation lasts */
const EXPLOSION_FRAMES = 7;
/* ─────────────── Bullet image ─────────────── */
/** Bullet sprite height in grid units (sprite is 20px, slot is 22px) — used for leading-edge collision */
const BULLET_SPRITE_HEIGHT_GU = 20 / 22;
const BULLET_IMAGE_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAACACAMAAACMX59YAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAByUExURQAAAP////7+/gBE/wBE/wBE/wBE/wBE/wBE/gBE/gBE/wBE/wBE/gBE/wBE/wBE/gBE/gBE/+cgMfUeJf8AAP8AAP4AAP4AAABE/wBE/hhW/y9m/y9n/yNd/4Sl/73O/7zO//8cHP4cHP8AAP4AAP///6QdcYAAAAAYdFJOUwAAAGbHk4W9hb1genq/3RYcHJPFhb2FvbKPFBsAAAABYktHRAH/Ai3eAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH6gUIFjcZmpji7QAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNi0wNS0wOFQyMjo1NToyNSswMDowMDWlEL0AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjYtMDUtMDhUMjI6NTU6MjUrMDA6MDBE+KgBAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDI2LTA1LTA4VDIyOjU1OjI1KzAwOjAwE+2J3gAAAk5JREFUaN7tVotWwyAMnahzvp2PSXxMZ/P/3+ggECija1N2ZDvuWmm17W1y82IyyeH0LIPzyXBMdQYXR4IjwZFATDAD0NoeYE/mT30pITBfNK/ZNx2TyAX3acvjL4QE2r/HFxIXptGHmUEkIkkXx0CmwczIl6KD4OqaccPnWx8BXtc/d9GDN/Twepmc6S5A7x1z3iCgDKJfoFxI7kEI7nrdYkGfWXQZE3DW5e2HrGM5C0Anj3aoATmCyH8XAr5B/05oxRpsYGcEvQ5vJwiFxzUAkDAlBUrpndWAshg09NsCO9TgPxEIamE8wZ5rMIzg7b2FD7t+CgiWJxl8lRJ8DyFwJbdUJ0rFLysm6AsjFFowVgMYQlBswX4TtLcSYAiUD59qhzEJGGwSmF5r80CFFAgW+JZND3ZO5zINYDgBbBFRjbdAV63GLQSqjwAghJMJXB4os7bL2e9C9iWVewlUN8H9g8OcYC8fVxY/qxhPc3rOH4T8Bvq5CUC/vgh26zEBYxQBugOrWVCNYOEVwKAE1nAB2YYxBBh/HQ8uCvUJFi7+VARIVwfmAqcBhmQWWoB1XdhFGNGFcb0cZBjjrszRLLWgkgbovJB2JJfKXIljUjlSEev0RJuArIF0vC84/AYNLX/sQtRIxoRxj4qpXkfiaeIm/J+HcbEDDSiRMRoQNV3AA8yDcgJM/G+EPdE3VUpFd5INV9+JXFMykLmAfjIjmyK0wLUj5NYkJKBx0sKrWIMEchGxsgVNsQVNCYEfLGEySrd5xSK6LArjdUwtDIrCL/JGvSI+ReIgAAAAAElFTkSuQmCC';
/* ───────────── Ship image ───────────── */
const SHIP_IMAGE_DATA = 'data:image/png;base64,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';


/***/ },

/***/ "./src/galaga/core/game.ts"
/*!*********************************!*\
  !*** ./src/galaga/core/game.ts ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GalagaGame: () => (/* binding */ GalagaGame)
/* harmony export */ });
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _renderers_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../renderers/svg */ "./src/galaga/renderers/svg.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "./src/galaga/core/constants.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/* ────────────────── Level helpers ────────────────── */
const LEVEL_ORDER = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];
/** Return the level one step below the given level (minimum NONE). */
const decrementLevel = (level) => {
    const idx = LEVEL_ORDER.indexOf(level);
    return LEVEL_ORDER[Math.max(0, idx - 1)];
};
const randomFramesForTarget = () => Math.floor(Math.random() * (_constants__WEBPACK_IMPORTED_MODULE_2__.FRAMES_PER_TARGET_MAX - _constants__WEBPACK_IMPORTED_MODULE_2__.FRAMES_PER_TARGET_MIN + 1)) + _constants__WEBPACK_IMPORTED_MODULE_2__.FRAMES_PER_TARGET_MIN;
const hasRemainingEnemies = (store) => store.grid.some((col) => col.some((cell) => cell.commitsCount > 0));
/**
 * Find the best column to target near the ship's current position.
 * Searches within an expanding radius (starting at 5) around the ship,
 * excluding `excludeCol`. Returns the highest-scoring column found.
 */
const findTargetColumn = (store, excludeCol = -1) => {
    const shipCol = Math.round(store.ship.x - 0.5);
    const scoreCol = (x) => store.grid[x].reduce((sum, cell) => {
        var _a;
        const weights = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
        return sum + ((_a = weights[cell.level]) !== null && _a !== void 0 ? _a : 0);
    }, 0);
    for (let radius = 3; radius <= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH; radius++) {
        let bestCol = -1;
        let bestScore = 0;
        for (let offset = -radius; offset <= radius; offset++) {
            const x = shipCol + offset;
            if (x < 0 || x >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH)
                continue;
            if (x === excludeCol)
                continue;
            const s = scoreCol(x);
            if (s > bestScore) {
                bestScore = s;
                bestCol = x;
            }
        }
        if (bestCol !== -1)
            return bestCol;
    }
    // Absolute fallback: first non-empty column
    for (let x = 0; x < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH; x++) {
        if (x !== excludeCol && store.grid[x].some((cell) => cell.commitsCount > 0))
            return x;
    }
    return Math.floor(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH / 2);
};
const pushSnapshot = (store) => {
    store.gameHistory.push({
        ship: { x: store.ship.x },
        bullets: store.bullets.map((b) => (Object.assign({}, b)))
    });
};
/* ────────────────── Game lifecycle ────────────────── */
const startGame = (store) => __awaiter(void 0, void 0, void 0, function* () {
    store.frameCount = 0;
    store.nextBulletId = 0;
    store.gameHistory = [];
    store.cellEvents = [];
    store.explosionEvents = [];
    store.bullets = [];
    store.grid = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.createGridFromData(store);
    store.initialColors = store.grid.map((col) => col.map((cell) => cell.color));
    if (!hasRemainingEnemies(store)) {
        const svg = _renderers_svg__WEBPACK_IMPORTED_MODULE_1__.GalagaSVG.generateAnimatedSVG(store);
        store.config.svgCallback(svg);
        store.config.gameOverCallback();
        return;
    }
    store.ship = { x: _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH / 2 };
    store.currentTargetCol = findTargetColumn(store);
    store.framesShootingAtTarget = 0;
    store.framesAllowedForTarget = randomFramesForTarget();
    const MAX_FRAMES = 3000;
    while (hasRemainingEnemies(store) && store.frameCount < MAX_FRAMES) {
        updateGame(store);
    }
    const svg = _renderers_svg__WEBPACK_IMPORTED_MODULE_1__.GalagaSVG.generateAnimatedSVG(store);
    store.config.svgCallback(svg);
    if (store.config.gameStatsCallback) {
        store.config.gameStatsCallback({
            totalScore: store.cellEvents.length,
            steps: store.frameCount,
            ghostsEaten: 0
        });
    }
    store.config.gameOverCallback();
});
const stopGame = (_store) => { };
/* ────────────────── Per-frame update ────────────────── */
const updateGame = (store) => {
    var _a;
    store.frameCount++;
    const { grid, ship } = store;
    const theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getCurrentTheme(store);
    // ── Move bullets upward & check collisions ───────────────────────────
    for (const bullet of store.bullets) {
        if (!bullet.active)
            continue;
        bullet.y -= _constants__WEBPACK_IMPORTED_MODULE_2__.BULLET_SPEED;
        // Off the top of the screen — deactivate
        if (bullet.y < -1) {
            bullet.active = false;
            continue;
        }
        // Column index the bullet occupies (bullet.x = col + 0.5)
        const col = Math.round(bullet.x - 0.5);
        // Collision when bullet base (bottom of sprite) enters the cell's y range
        const row = Math.floor(bullet.y);
        if (col >= 0 && col < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH && row >= 0 && row < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT) {
            if (grid[col][row].commitsCount > 0) {
                const prevColor = grid[col][row].color;
                const newLevel = decrementLevel(grid[col][row].level);
                grid[col][row].level = newLevel;
                grid[col][row].color = theme.intensityColors[LEVEL_ORDER.indexOf(newLevel)];
                if (newLevel === 'NONE') {
                    grid[col][row].commitsCount = 0;
                    store.explosionEvents.push({
                        frameIndex: store.gameHistory.length,
                        x: col,
                        y: row,
                        color: prevColor
                    });
                }
                store.cellEvents.push({
                    frameIndex: store.gameHistory.length,
                    x: col,
                    y: row,
                    color: grid[col][row].color
                });
                store.config.pointsIncreasedCallback(store.cellEvents.length);
                bullet.active = false;
            }
        }
    }
    // Remove inactive bullets
    store.bullets = store.bullets.filter((b) => b.active);
    // ── Ship AI: move toward locked-on target column ────────────────────
    // If current target is depleted, pick a fresh one
    if (!((_a = grid[store.currentTargetCol]) === null || _a === void 0 ? void 0 : _a.some((cell) => cell.commitsCount > 0))) {
        store.currentTargetCol = findTargetColumn(store);
        store.framesShootingAtTarget = 0;
    }
    const targetCol = store.currentTargetCol;
    const targetX = targetCol + 0.5;
    const dx = targetX - ship.x;
    if (Math.abs(dx) > _constants__WEBPACK_IMPORTED_MODULE_2__.SHIP_SPEED) {
        ship.x += Math.sign(dx) * _constants__WEBPACK_IMPORTED_MODULE_2__.SHIP_SPEED;
    }
    else {
        ship.x = targetX;
    }
    ship.x = Math.max(_constants__WEBPACK_IMPORTED_MODULE_2__.SHIP_HALF_WIDTH, Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - _constants__WEBPACK_IMPORTED_MODULE_2__.SHIP_HALF_WIDTH, ship.x));
    // ── Fire: shoot for FRAMES_PER_TARGET frames then switch target ───────
    const aligned = Math.abs(ship.x - targetX) < 0.5;
    const columnHasEnemies = grid[targetCol].some((cell) => cell.commitsCount > 0);
    if (aligned && columnHasEnemies) {
        if (store.framesShootingAtTarget >= store.framesAllowedForTarget) {
            // Done with this target — pick next column (excluding current)
            store.currentTargetCol = findTargetColumn(store, targetCol);
            store.framesShootingAtTarget = 0;
            store.framesAllowedForTarget = randomFramesForTarget();
        }
        else {
            if (store.frameCount % _constants__WEBPACK_IMPORTED_MODULE_2__.FIRE_RATE === 0 && store.bullets.length < _constants__WEBPACK_IMPORTED_MODULE_2__.MAX_BULLETS) {
                store.bullets.push({
                    id: store.nextBulletId++,
                    x: targetX,
                    y: _constants__WEBPACK_IMPORTED_MODULE_2__.SHIP_Y - 1.0,
                    active: true
                });
            }
            store.framesShootingAtTarget++;
        }
    }
    pushSnapshot(store);
};
const GalagaGame = { startGame, stopGame };


/***/ },

/***/ "./src/galaga/core/store.ts"
/*!**********************************!*\
  !*** ./src/galaga/core/store.ts ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GalagaStore: () => (/* binding */ GalagaStore)
/* harmony export */ });
const GalagaStore = {
    frameCount: 0,
    nextBulletId: 0,
    contributions: [],
    ship: { x: 0 },
    bullets: [],
    grid: [],
    monthLabels: [],
    gameHistory: [],
    initialColors: [],
    cellEvents: [],
    explosionEvents: [],
    currentTargetCol: -1,
    framesShootingAtTarget: 0,
    framesAllowedForTarget: 4,
    config: undefined
};


/***/ },

/***/ "./src/galaga/index.ts"
/*!*****************************!*\
  !*** ./src/galaga/index.ts ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GalagaRenderer: () => (/* binding */ GalagaRenderer)
/* harmony export */ });
/* harmony import */ var _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shared/providers/providers */ "./src/shared/providers/providers.ts");
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _core_game__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/game */ "./src/galaga/core/game.ts");
/* harmony import */ var _core_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/store */ "./src/galaga/core/store.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




class GalagaRenderer {
    constructor(conf) {
        this.conf = Object.assign({}, conf);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultConfig = {
                platform: 'github',
                username: '',
                svgCallback: (_) => { },
                gameOverCallback: () => { },
                gameTheme: 'github',
                pointsIncreasedCallback: (_) => { },
                githubSettings: { accessToken: '' }
            };
            this.store = JSON.parse(JSON.stringify(_core_store__WEBPACK_IMPORTED_MODULE_3__.GalagaStore));
            this.store.config = Object.assign(Object.assign({}, defaultConfig), this.conf);
            switch (this.store.config.platform) {
                case 'gitlab':
                    this.store.contributions = yield _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__.Providers.fetchGitlabContributions(this.store);
                    break;
                case 'github':
                    this.store.contributions = yield _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__.Providers.fetchGithubContributions(this.store);
                    break;
                default:
                    throw new Error(`Unsupported platform: ${this.store.config.platform}`);
            }
            _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.buildGrid(this.store);
            _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.buildMonthLabels(this.store);
            yield _core_game__WEBPACK_IMPORTED_MODULE_2__.GalagaGame.startGame(this.store);
            return this.store;
        });
    }
    stop() {
        _core_game__WEBPACK_IMPORTED_MODULE_2__.GalagaGame.stopGame(this.store);
    }
}


/***/ },

/***/ "./src/galaga/renderers/svg.ts"
/*!*************************************!*\
  !*** ./src/galaga/renderers/svg.ts ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GalagaSVG: () => (/* binding */ GalagaSVG)
/* harmony export */ });
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/constants */ "./src/galaga/core/constants.ts");


const SVG_PRECISION = 4;
/** Convert a grid-unit x coordinate to SVG pixels */
const toSvgX = (gx) => gx * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE);
/** Convert a grid-unit y coordinate to SVG pixels (offset by month-label area) */
const toSvgY = (gy) => gy * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + 15;
/**
 * Extract individual bullet trajectories from the game history.
 * Bullets are matched across frames by their unique `id`.
 */
const extractBulletFlights = (store) => {
    const flights = [];
    const active = new Map();
    for (let f = 0; f < store.gameHistory.length; f++) {
        const bullets = store.gameHistory[f].bullets.filter((b) => b.active);
        const currentIds = new Set(bullets.map((b) => b.id));
        // Bullets no longer present → close their flights
        for (const [id, flight] of active) {
            if (!currentIds.has(id)) {
                flights.push({
                    id,
                    x: flight.x,
                    startFrame: flight.startFrame,
                    endFrame: f - 1,
                    yPositions: flight.yPositions
                });
                active.delete(id);
            }
        }
        // New bullets → open flights
        for (const bullet of bullets) {
            if (!active.has(bullet.id)) {
                active.set(bullet.id, { x: bullet.x, startFrame: f, yPositions: [bullet.y] });
            }
            else {
                active.get(bullet.id).yPositions.push(bullet.y);
            }
        }
    }
    // Flush any flights still open at end
    for (const [id, flight] of active) {
        flights.push({
            id,
            x: flight.x,
            startFrame: flight.startFrame,
            endFrame: store.gameHistory.length - 1,
            yPositions: flight.yPositions
        });
    }
    return flights;
};
/* ────────────────── Main SVG generator ────────────────── */
const generateAnimatedSVG = (store) => {
    const svgWidth = _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE);
    const shipAreaHeight = 90;
    const svgHeight = _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + 15 + shipAreaHeight;
    const totalFrames = store.gameHistory.length;
    const totalDurationMs = Math.max((totalFrames * _core_constants__WEBPACK_IMPORTED_MODULE_1__.DELTA_TIME) / 2, 1000);
    const theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getCurrentTheme(store);
    const shipSvgY = toSvgY(_core_constants__WEBPACK_IMPORTED_MODULE_1__.SHIP_Y);
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<desc>Generated with galaga-contribution-graph on ${new Date()}</desc>`;
    svg += `<rect width="100%" height="100%" fill="#000000"/>`;
    // ── Galaxy starfield ──────────────────────────────────────────────────
    {
        let starSeed = 12345;
        const starRng = () => {
            starSeed = (starSeed * 1664525 + 1013904223) >>> 0;
            return starSeed / 0xffffffff;
        };
        for (let i = 0; i < 120; i++) {
            const scx = (starRng() * svgWidth).toFixed(1);
            const sr = (0.4 + starRng() * 1.6).toFixed(1);
            const sop = (0.3 + starRng() * 0.7).toFixed(2);
            const spd = Math.floor(2500 + starRng() * 5500);
            const sph = Math.floor(starRng() * spd);
            svg += `<circle cx="${scx}" cy="0" r="${sr}" fill="white" opacity="${sop}"><animate attributeName="cy" from="-2" to="${svgHeight + 2}" dur="${spd}ms" begin="-${sph}ms" repeatCount="indefinite"/></circle>`;
        }
    }
    // ── Month labels ─────────────────────────────────────────────────────
    let lastMonth = '';
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH; x++) {
        if (store.monthLabels[x] !== lastMonth) {
            const xPos = x * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2;
            svg += `<text x="${xPos}" y="10" text-anchor="middle" font-size="10" fill="#aaaaaa">${store.monthLabels[x]}</text>`;
            lastMonth = store.monthLabels[x];
        }
    }
    // ── Grid cells (enemy formation) ─────────────────────────────────────
    const noneColor = theme.intensityColors[0];
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH; x++) {
        for (let y = 0; y < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT; y++) {
            const cellX = toSvgX(x);
            const cellY = toSvgY(y);
            const colorAnim = getCellAnimationData(store, x, y);
            const cellValues = colorAnim.values
                .split(';')
                .map((c) => (c === noneColor ? 'transparent' : c))
                .join(';');
            svg += `<rect x="${cellX}" y="${cellY}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE}" rx="3" fill="transparent">
				<animate attributeName="fill" calcMode="discrete" dur="${totalDurationMs}ms" repeatCount="indefinite"
					values="${cellValues}" keyTimes="${colorAnim.keyTimes}"/>
			</rect>`;
        }
    }
    // ── Bullets ───────────────────────────────────────────────────────────
    if (totalFrames >= 2) {
        const flights = extractBulletFlights(store);
        for (const flight of flights) {
            const svgX = toSvgX(flight.x);
            const tStart = Number((flight.startFrame / (totalFrames - 1)).toFixed(SVG_PRECISION));
            const tEndNext = Number((Math.min(flight.endFrame + 1, totalFrames - 1) / (totalFrames - 1)).toFixed(SVG_PRECISION));
            // Build opacity keyTimes/values (discrete: 0 outside flight, 1 inside)
            let opKeyTimes, opValues;
            if (tStart <= 0 && tEndNext >= 1) {
                opKeyTimes = '0;1';
                opValues = '1;1';
            }
            else if (tStart <= 0) {
                opKeyTimes = `0;${tEndNext};${tEndNext};1`;
                opValues = `1;1;0;0`;
            }
            else if (tEndNext >= 1) {
                opKeyTimes = `0;${tStart};${tStart};1`;
                opValues = `0;0;1;1`;
            }
            else {
                opKeyTimes = `0;${tStart};${tStart};${tEndNext};${tEndNext};1`;
                opValues = `0;0;1;1;0;0`;
            }
            // Build position keyTimes/values (compact, only records changes)
            const posKeyTimes = [];
            const posValues = [];
            const firstSvgY = toSvgY(flight.yPositions[0]).toFixed(1);
            const lastSvgY = toSvgY(flight.yPositions[flight.yPositions.length - 1]).toFixed(1);
            if (flight.startFrame > 0) {
                posKeyTimes.push(0);
                posValues.push(`${svgX.toFixed(1)},${firstSvgY}`);
            }
            for (let i = 0; i < flight.yPositions.length; i++) {
                const frameIdx = flight.startFrame + i;
                const t = Number((frameIdx / (totalFrames - 1)).toFixed(SVG_PRECISION));
                const svgY = toSvgY(flight.yPositions[i]).toFixed(1);
                if (posKeyTimes.length === 0 || t !== posKeyTimes[posKeyTimes.length - 1]) {
                    posKeyTimes.push(t);
                    posValues.push(`${svgX.toFixed(1)},${svgY}`);
                }
            }
            if (posKeyTimes[posKeyTimes.length - 1] !== 1) {
                posKeyTimes.push(1);
                posValues.push(`${svgX.toFixed(1)},${lastSvgY}`);
            }
            // Bullet image: 16x20px, centered on bullet x, top at y=0
            svg += `<image x="-5" y="-13" width="10" height="13" href="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BULLET_IMAGE_DATA}" opacity="0" preserveAspectRatio="xMidYMid meet">
				<animate attributeName="opacity" calcMode="discrete" dur="${totalDurationMs}ms" repeatCount="indefinite"
					keyTimes="${opKeyTimes}" values="${opValues}"/>
				<animateTransform attributeName="transform" type="translate" calcMode="linear"
					dur="${totalDurationMs}ms" repeatCount="indefinite"
					keyTimes="${posKeyTimes.join(';')}" values="${posValues.join(';')}"/>
			</image>`;
        }
    }
    // ── Explosions ────────────────────────────────────────────────────────
    if (totalFrames >= 2) {
        for (const exp of store.explosionEvents) {
            const cx = (toSvgX(exp.x) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2).toFixed(1);
            const cy = (toSvgY(exp.y) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2).toFixed(1);
            const tS = Number((exp.frameIndex / (totalFrames - 1)).toFixed(SVG_PRECISION));
            const tE = Number((Math.min(exp.frameIndex + _core_constants__WEBPACK_IMPORTED_MODULE_1__.EXPLOSION_FRAMES, totalFrames - 1) / (totalFrames - 1)).toFixed(SVG_PRECISION));
            if (tE <= tS)
                continue;
            // keyTimes with a duplicate at tS so opacity jumps in (no pre-fade)
            const kt = `0;${tS};${tS};${tE};1`;
            const opVals = `0;0;1;0;0`;
            const dur = `${totalDurationMs}ms`;
            // Expanding ring
            svg += `<circle cx="${cx}" cy="${cy}" r="2" fill="none" stroke="${exp.color}" stroke-width="3" opacity="0">
				<animate attributeName="r"            calcMode="linear" dur="${dur}" repeatCount="indefinite" keyTimes="${kt}" values="2;2;2;${_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE};${_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE}"/>
				<animate attributeName="stroke-width" calcMode="linear" dur="${dur}" repeatCount="indefinite" keyTimes="${kt}" values="3;3;3;0;0"/>
				<animate attributeName="opacity"      calcMode="linear" dur="${dur}" repeatCount="indefinite" keyTimes="${kt}" values="${opVals}"/>
			</circle>`;
            // 4 sparks flying outward
            const sparks = [
                { dx: 0, dy: -11 },
                { dx: 0, dy: 11 },
                { dx: -11, dy: 0 },
                { dx: 11, dy: 0 }
            ];
            for (const { dx, dy } of sparks) {
                const tx = (Number(cx) + dx).toFixed(1);
                const ty = (Number(cy) + dy).toFixed(1);
                svg += `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${exp.color}" opacity="0">
					<animate attributeName="cx"      calcMode="linear" dur="${dur}" repeatCount="indefinite" keyTimes="${kt}" values="${cx};${cx};${cx};${tx};${tx}"/>
					<animate attributeName="cy"      calcMode="linear" dur="${dur}" repeatCount="indefinite" keyTimes="${kt}" values="${cy};${cy};${cy};${ty};${ty}"/>
					<animate attributeName="r"       calcMode="linear" dur="${dur}" repeatCount="indefinite" keyTimes="${kt}" values="2.5;2.5;2.5;0;0"/>
					<animate attributeName="opacity" calcMode="linear" dur="${dur}" repeatCount="indefinite" keyTimes="${kt}" values="${opVals}"/>
				</circle>`;
            }
        }
    }
    // ── Ship ──────────────────────────────────────────────────────────────
    const shipPositions = store.gameHistory.map((f) => {
        const sx = toSvgX(f.ship.x);
        return `${sx.toFixed(1)},${shipSvgY.toFixed(1)}`;
    });
    const shipAnim = buildChangingValuesAnimation(store, shipPositions);
    svg += `<image x="-16" y="-35" width="32" height="35" href="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.SHIP_IMAGE_DATA}" preserveAspectRatio="xMidYMid meet">
		<animateTransform attributeName="transform" type="translate" calcMode="linear"
			dur="${totalDurationMs}ms" repeatCount="indefinite"
			keyTimes="${shipAnim.keyTimes}"
			values="${shipAnim.values}"/>
	</image>`;
    svg += '</svg>';
    return svg;
};
/* ────────────────── Animation helpers ────────────────── */
const getCellAnimationData = (store, x, y) => {
    var _a, _b;
    const totalFrames = store.gameHistory.length;
    const initialColor = (_b = (_a = store.initialColors[x]) === null || _a === void 0 ? void 0 : _a[y]) !== null && _b !== void 0 ? _b : '#ebedf0';
    const events = store.cellEvents.filter((e) => e.x === x && e.y === y);
    if (events.length === 0) {
        return { keyTimes: '0;1', values: `${initialColor};${initialColor}` };
    }
    const kTimes = [0];
    const kValues = [initialColor];
    for (const ev of events) {
        const t = Number((ev.frameIndex / Math.max(totalFrames - 1, 1)).toFixed(SVG_PRECISION));
        if (t !== kTimes[kTimes.length - 1]) {
            kTimes.push(t);
            kValues.push(ev.color);
        }
        else {
            kValues[kValues.length - 1] = ev.color;
        }
    }
    if (kTimes[kTimes.length - 1] !== 1) {
        kTimes.push(1);
        kValues.push(kValues[kValues.length - 1]);
    }
    return { keyTimes: kTimes.join(';'), values: kValues.join(';') };
};
const buildChangingValuesAnimation = (store, values) => {
    var _a, _b, _c, _d;
    const totalFrames = store.gameHistory.length;
    if (totalFrames === 0) {
        const v = (_a = values[0]) !== null && _a !== void 0 ? _a : '0,0';
        return { keyTimes: '0;1', values: `${v};${v}` };
    }
    const keyTimes = [];
    const keyValues = [];
    let lastValue = null;
    let lastIndex = null;
    values.forEach((curr, idx) => {
        if (curr !== lastValue) {
            if (lastValue !== null && lastIndex !== null && idx - 1 !== lastIndex) {
                keyTimes.push(Number(((idx - 1) / (totalFrames - 1)).toFixed(SVG_PRECISION)));
                keyValues.push(lastValue);
            }
            keyTimes.push(Number((idx / (totalFrames - 1)).toFixed(SVG_PRECISION)));
            keyValues.push(curr);
            lastValue = curr;
            lastIndex = idx;
        }
    });
    if (keyTimes.length === 0 || keyTimes[keyTimes.length - 1] !== 1) {
        if (keyTimes.length === 0) {
            keyTimes.push(0, 1);
            keyValues.push((_b = values[0]) !== null && _b !== void 0 ? _b : '0,0', (_c = values[values.length - 1]) !== null && _c !== void 0 ? _c : '0,0');
        }
        else {
            keyTimes.push(1);
            keyValues.push((_d = lastValue !== null && lastValue !== void 0 ? lastValue : values[values.length - 1]) !== null && _d !== void 0 ? _d : '0,0');
        }
    }
    return { keyTimes: keyTimes.join(';'), values: keyValues.join(';') };
};
const GalagaSVG = { generateAnimatedSVG };


/***/ },

/***/ "./src/pacman/core/constants.ts"
/*!**************************************!*\
  !*** ./src/pacman/core/constants.ts ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CELL_SIZE: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE),
/* harmony export */   DELTA_TIME: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.DELTA_TIME),
/* harmony export */   GAME_THEMES: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GAME_THEMES),
/* harmony export */   GAP_SIZE: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE),
/* harmony export */   GHOSTS: () => (/* binding */ GHOSTS),
/* harmony export */   GHOST_NAMES: () => (/* binding */ GHOST_NAMES),
/* harmony export */   GRID_HEIGHT: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT),
/* harmony export */   GRID_WIDTH: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH),
/* harmony export */   MONTHS: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.MONTHS),
/* harmony export */   PACMAN_COLOR: () => (/* binding */ PACMAN_COLOR),
/* harmony export */   PACMAN_COLOR_DEAD: () => (/* binding */ PACMAN_COLOR_DEAD),
/* harmony export */   PACMAN_COLOR_POWERUP: () => (/* binding */ PACMAN_COLOR_POWERUP),
/* harmony export */   PACMAN_DEATH_DURATION: () => (/* binding */ PACMAN_DEATH_DURATION),
/* harmony export */   PACMAN_POWERUP_DURATION: () => (/* binding */ PACMAN_POWERUP_DURATION),
/* harmony export */   WALLS: () => (/* binding */ WALLS),
/* harmony export */   hasWall: () => (/* binding */ hasWall),
/* harmony export */   setWall: () => (/* binding */ setWall)
/* harmony export */ });
/* harmony import */ var _shared_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/constants */ "./src/shared/constants.ts");
/* ─── Re-export shared constants so pacman code has one import location ─── */

/* ───────────── Pacman colours ───────────── */
const PACMAN_COLOR = 'yellow';
const PACMAN_COLOR_POWERUP = 'red';
const PACMAN_COLOR_DEAD = '#80808064';
const GHOST_NAMES = ['blinky', 'clyde', 'inky', 'pinky', 'eyes'];
const PACMAN_DEATH_DURATION = 10;
const PACMAN_POWERUP_DURATION = 15;
/* ───────────── Ghost sprites (base64) ───────────── */
const GHOSTS = {
    blinky: {
        up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABiklEQVR4nIXSO2sVURQF4G8mMwa8QU2KxFcjCoIgacR/oCBYCP4fsTEIBkWwEK21UAQLIdjYaKEiJIXBXhNBCFaSeDP3zLa4mdyj5rHgwNmPtffZ62z+Q4miKHlWs3yALwUvKYphbC8UjDN3nIUB/SCCSDRnWKiZVxTFrvxp5kMRHbEltaTODuIED3YkT3FnUy+uS815qQkzMSJOxAWpuSo1A72Y4f5f5DFuBpE+vmsmZ9ukF9Eu/xwV+Pw1TEYcOtum9GmxCaLmdl7jeRDp968mcnQFMqS02bSkMV5tS36UBL6t7ixO6o/uK6sKymM0Q9l5NKC/Ldb3lWGrqenRCw73hr61H9viDujjKbztnLnae50uF4sl1nf91/2xvt9q7YuyEwKCNg+2DFoGue/fnHLoGwbyZQ/akqqkykkFZW6XmNy6VJdYyhPP8eE07/PCl1kqqbbMI3BrjY1rvMH4SW4kmou86Eac5UmiOcUcxq/wep2NirugYh4TXfOah6izUauax5leB2vuwR+e2vAshd8i9AAAAABJRU5ErkJggg==',
        down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABmUlEQVR4nHXTT0tUYRQG8N97/TOloSYpYv/BNlLYqqJli1Z9gz5SOwkKgpDaRBS5CKJ2fYFWrsyNZWKSOYliw8y9p8XMHa+Tc+ByOec8z/M+7z3nJidHwhtc7ORreIjog29H1iYunmc5iPIpyGd5h0cd8ZNPvcLzXmJBXq1N8/g/kSSlyywFkdPMaVZJvfVZnkhHImmSZyWol9jrqMSMsti5tmhwJyhSO+8bZT8ogrulQDbDQZe8/ZPt38eZA9jbZ2OjKzTFPpJxPrdoBFFsruVRxq+tI/v1nW45vn2NIFo0TvMxTdLcYRBt+DHPne/Up36GvaygDn+p17+srp+d59S1KHyvXOPHgaFLTC9gfUtQdDp/TLAbRJPDQ2O7cyIuiAgzlQlcjSkR8yLCWJS7McJGV6Df2HoXqZqPsJmVdk56J7JEVrGsmida2TATZeM+q+U4E9kcKzdYqe7Hg+OYcdN8atG41f5Zagu8KMhv8rbck9u8L8iv8xS1e3xo0TjHMgyM8BJDnUMGa7xWjrYdQ8O8cuSkNsoSsn/EzgO2a6zxyAAAAABJRU5ErkJggg==',
        left: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABzklEQVR4nIWSy2tTURCHvzNnzk0TS21sQluhq4Kb+sAH4qrgyoV/oNuCUIogEUGKf4DoolBFfCC4sYKgDVXig/Tec8ZF7k1uo9GBWczvnN8H84DpcM6h6ruw14VBBwZdeIX3inPuj//18FkmS/jtDdgvYGhgBhYhvwwv2khPs8z/3R2CnIcHlWlWXsXvMleDOEBVZaM0R8gTxGljghghN7BLyK4PwY/6UeUsbNuZlsVvn3JLyWz+1MTc8mbHP8x+HpmpWgVZhh5OKsbc0/6bgxhjzM3MbDicAN4f2jj6fUsQE8R52McBrcz7VbpPaJmxWALMxoBOMPMrE0bV3hXYC42grMCziOY3SJG18lf+fQxYx6y1XupfP1t9M6vwkjZ8GQ3JR3t3YHY8MGvWZsBpsw99s8GhmZwcbBd+sQQf/7e6WdmBIynKdRqkf17ZjBCrFdMQg5SgmNbqNySuFAySGwFP1AI6rVW1g0KANoCA3oK3DqR8lIvw/Bzs17Xb8LqqBTosI70ChjfhEVnWuIC/EyHfhIc4L2jmrqH3IuTX0S2azcYmcr+A4RrymCwEafuwJaoNAB+CLKjuiGoY9+q9XxDdcSF4AFEJiyJ3QwjyGx0DPZpbZTAYAAAAAElFTkSuQmCC',
        right: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABp0lEQVR4nI3TO2tUQRQH8N+9e9eg0YBBlwR8gNHKRqz8Amph4zcSBCWgEBALQbAU0U4EUewsfDQJNuIDiaAkSNhCY3Rz79xjsdndaxKDB6aYM//HzDln2DayrMXDgrct3hXcR7Y9dhMT14/wNFEGEURFb5onuLKjzDQ3B6QgalJNauamuLYt+SA3gkiUTffBauYPbBbJmB2AalJ8+Ryx2o1oN0Qm9kSdeim9Xyh/FFm0uNzUeFSTEmUsfoxhLC6NBNbXIyIipVR+fTGf8AAKZB2qjDyoHZ0B+04wvjJleWDRbisTuzponcon5Om7OoN7Fb1hsVY+RUTE2PGIw2J0g6jjd0TYG3FBnSp6uAPzg4oPwd1vEUvdCJ2RwNRk/1mvPwyxeF5gbUtLJjtb27TcJdsyBGs58n+Mxf9E6y9yUDf3NVVNtQOmzm0Agjpr3Cb6h0VO0SQNu9WPlGNS/x3FWRaawBlenuRVU/g8b/J++2G/grlVfp3jMcaOMZsoT3O3ryM/w4OK3iEuYewiz9b4iasDtznsHpi3uG3kAu2CW0Zfery98R/+AA8N/U/uOBf2AAAAAElFTkSuQmCC'
    },
    pinky: {
        up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACkElEQVR4nG2TT2hcVRTGf/fc+2bey4xJk9hoXGlMES0uCoVoF4IWW1BEkWBB6lKwEPBPLXUlhYIYEiouRDdSsGDalJYmrtIuhECLC0MQIaWmgo2RJo0WMmn+zMy997h4aScTenbn+8453+E798L2EECMFHDjCWbRwoLDTmBEcrI5TFNiDWVjhtJgX549fGV3W+nplKisV+dqu344+NuKrP1SMeZDfNSHDsgonprq//njZ7v2QpJAYZOoAhswW5lm37mXvvlX7w00rZEkiSlRHLz5/mXd1xbqEOr6kaoeq6l+qqqfqEKoP1/21bkPJrWMG7bW5uLGGIDj1/svqq/4as+LqjjVym1V/TKqnlBdW1ClRfWJPap+xVf/endcgc+NMThVBejY6UrQAn9e27JazUCA7DHQ1RwKAbq0FaBTVRFxTtpNKU1dEe5us7gG1IGwBVuGLEnoIMuMtWKAL268ef5Y73NvI8E7jhagCxhSmN/0uLsOx5Nc4NQaUVN/64+f6Lnw1rcOKJVc0WHwrCYwCFiFumncaDGBzzxEB7UClKHVpA4oOSCEGPNCFyFY8Kb5wApsuM3D50RdPECQBgSEmDc2gIYBFhAFzcVMFADbeJsKMbVeVSOqoEpIqYUitTwPqBJjwXoCaN4aBfAh+BjT6OXO786YuqgQY6rezk0VZP7XQiyqRyxGosidaRez6GMIEfACdO7IOsUt/Zc+dfbA2MTMdzVTNrJy+6orjPSdcT++cHr5n0lHBpMz3/snR1+95Jb+TtvTRwR4FOCNM6+cXOorPTMKOIF3xl77er3btn8FgMDjbufQ+OvDVYH3ALen3Ds6sv/EMtB/34FDQEtusgE4wpa/K4IAAyIPoIx8GP8DW7gOkh3Y7ZsAAAAASUVORK5CYII=',
        down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACZ0lEQVR4nHWRy4vNYRjHP8/ze885c+GIuTSZxriMS6KkKeQSK0lRDAsbthaTzSyUqYlhxYIsJkTNiGYh+RMYKRFTM5Fxq8ll3BriMOac3+95LM45GYOn3sX79n2/l+cL/58e4CkwAtwFwr9A8tfNOQJsernr2toFtauyFPIgORp7tw68TT6PAgcA+zcBdD7be6O7pXYDVNbgkVsRJEruPR6/puH85hsfyO0uk0gJgOOdT3b1d7csbctLQVRjDXhZxrHgMQH041Cov7jx+kdye0TERERw90PDOy6fXr5yXyxfRcVRomnmzADHqiTWT4Mhc7H1ch72q7sDNC+qnI/FFkslyhwB8d+f3SBL8RTAq5otDysA11IMicSQClE6BI4CS7yYUoB6h2MKxyOYC1JItEGyeSAC6B7c2Tdhhy3xN/7nnHD3jrz7xJQ3c7cuS5L99wsKdxRoakrXVzhu1JTilt1nAI+gYlrVATQ1NxgsUyA/GSfgwBdYvB4ihVfPgRQgCuOgjSDV4O9AIlFsEmBCAfEIUOBsQsNIUajpFPCmALHDSWgag+wPkFPANyAogAbABcDBc2q396HFtYJZFBMc/S5htL0UL7ZYEBUxBUyBxA085Sb510rKIICn3fTHWNBvo4FM0aFn3PTnWPCUW0k2VmDWjFSGKCHdemXL0IMXvUYFyM9Xurh39aCcWziQez8AlWDjD3VZ3+pBHX8USGcB6gDab23r+by9dt09oErg4HDb1ck1M5feLK2RaqIzI3v7JxeEuj4gPU9nX3rc1j+RRq6Wy+kCaqeUdQaYMa28C2XCYpH0iKC/AKR7DJ4ZSbreAAAAAElFTkSuQmCC',
        left: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACnklEQVR4nG2TTYiVZRTHf+c8z/vee+emNVycYBocHAqGEN3IgEgg7bIZBir72CW2aNEERZiK6Ci4sNrooi9q02KaZhYubNGuhVEkLcqmLkhpwgwqRGBzZ+6d+77POS7uxUw8yz+HP/+Pc+C+EREIIsAc8AdwBVhEEOT+bf4PxTySinQid9+z8vKFpxoDT1RB+KdzrTM69+zFDuknsni0LMoHEAhkzuzV/V+fGNmyC2qP4sENQLqirK9wa+0XHv9q+kzL7DBm9xCoImbHf33x/Mnx8amurIlqVyOSIAnUFcus9MLtxl/f5FsXJk+6yCzufc/wxqVXvvC0lgozS3624z6T3Gfc/T1zd3dvuduxjVQeKjeaz8078I6IoO4OMMaBHXjFTUSUNyswBNQcXu27rIO8nSsK45VRgG3ujoYsyAC5TDyzkxhh5UY/k0zgtlAZhXxrHxsEHNCe/xijaCrS4e9e+Pz1fQ+7Qcgl7y+XBgapfU9N6xDakvtju+3n5+deK8vytAIjw9aoXjjo5k0YbgAfJripUIXyXeg2gQ7wfgHJ8MxtRBs5MBKBdpE2oArMlUCA1dDrR7yn5IMAXevhwcGgSwGwHgHtSQb+TSCxh4iDOxQKfwOiEB3KBATUBSBEQFx64XiWmxgKBg6WU4KjySMGJMFDNMzvxqJAwhzP3WT9poJDVDyKaet61Nb16CoGCkGQ9rJ65ma9I00K1DfHOqFb5hOLey83l+eNKsja7zr82Y4ft3z65PfSWlIG4M/lBXYuPH05dDv55vwhgE0AB7+d+vj29NDEJaD2SNj01tJLX7a317adBxRBx+tji7/tX9gYjLUjQG3f0MQPFyc/WQVmCCGg6DGgAaBRBfQcSOU/n5oBH/XfHGBQ4JRq5A5IWx73SeLhogAAAABJRU5ErkJggg==',
        right: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACmUlEQVR4nGWTT4iWVRTGf+fce9/vj6Nf4/hnRlEERVcuAsFw0SKRRAhSiBJXgiQiqNRCwc1AC6FsihYVtrKYWShRkkSudBNFCPkVrSSmwj/ziVoa8c3Me99zXLzfTJTP6p57D8957nnOgf9DAUECXCxgJsGdAvmWIAF9Khv5TxAChcWJpsuO6QOXtw4v29wmOzZ3P2+Y3Nm9XT3qWvRDZPxpAkWWWXp/ev/lY8uXbwfpQGvw5sDsn/jjXxn7dOf5Ho8PDm5rgpSSpOzvTL/21Zsja3bNS1tURSL3ARWIjuGZlfD37e/jxg93n38U+wdzzo6IAJz+7dVLnk/mOR8391mvcc7dT7j78dL93Xl3d6+qqnxw6ppH+EBVUXcHWDXGSN3A4wINyEB/HzAELBV4IwFQAX+8vMUyjJkZKkG0Q7MoUgIDnqm/3VoN7RXAPaAIAPT79fHZ50Z1tFiXUiCoV/7e9b2Th2zdthz6FMzUBBs2wfBCyVwBEFvAKo27Om4/7596qaz4XIHO0tCICLWCCaAHN6/Cw3FqJ/5SOFOSSvAuXDkCK6qmAsMRKDNWmxIc5oG3HaJBqRCkNquX4HQeWB4G0igVcF0YB/fa2EpgNoDZQmKNuQh9Bwev3bN/h9PAipDd3RBAK6whuWowj/giubVCxsEGRRWwbJVZy7Le60aRSgGskKx3f4x+64fCE4YKBNBeN1rLsrlZrR5WjjQ7Gh/2musv7P7ym18+nqUNVe+7OPTZ9qk0teOTmd+vKEvgxs1J1k4+fzHc+alIjSEFRgH2Tr3w1oNtnU0XgAi8cmnPRH99Y/VHSK1ziDj+9YtnyzbFUSBsbKw998Wes/8Ahxc6cABZXB2AIyISFvdMVYATMcZBTAJeB3gCWn4PpFt1S94AAAAASUVORK5CYII='
    },
    inky: {
        up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABzklEQVR4nJWTzWtTURDFf3fyXtqSCKa1GsWPTRG6UdSVa/8pV+JK6kYh4EoIIrgRuhAMgitdWGqhdtFWq0IoIsVqQUSSZ/Jy73HxkvBin6ADA3fOnXOGmbkXCqwEBrSATWAbeGhFiYeIpdgBDY7OtfiUpHgJSbz7kjBVfQrciO3vUo7aqQe0BxlJEiF4QvDZWeLNZzF15JYrJB+bb7KZiMuDHhd8OhYZ+Vmfcs2nbOyK8vRt54YyBlCqNPja1bL3KRY8Jj3JkVu/JJCO14N/5H3K1q6Amy4rDWCvCMH/8D4NA6kfJJ8TkKQkSApS2/uUrgQsA1jknDFbH+CcfQRcCWIHO7n+vgHTLqu2A+CBciWNsz7Kz9nv90bDakv68Gf/kg4kreSH+3YvAe4Dtj8GC4iFHoLnpwSsGdD5lzdyyPoC6NpoEf9v2Q5stAcAQhhM5IQwKMRyZhACAFLALEKajPMYMI6VZRnY/PAmYuHiaw76WUvfMWZmX3LizApyGba9B4tX1jGLqABQg3K1yepWh3MLTYOIk6fvst7uMVe/5xj+zPOLj1l7n1CtXY8h5tLVZ7zY6ABLWGQOuOMgAnDOGdBgcrjxEBsNbAZYMov4DRt5NkCBfZ1GAAAAAElFTkSuQmCC',
        down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB10lEQVR4nIWT3WsTURDFfzP37hrTD1QM9hPTYlP7ov6hvgcsvhSUUpD+EfUpRKEi+CRUkYgFrTakabK5d3zYTbLRiAcG7s6eM3vmsBfmQMCRpi1uLFyQVi+oVE8UdB53Bk5EcZWXrNbbXIUMM8PMuBwNqN1/C5XnDmSu2IOyvnXMsBDNq64ZtbUjnRkigogoK5u5OISMGMNf4hAyQuFqe+/QqU6GCEn1BYOC9K+vlwf1zPDJviMPxsiudkks/jekMW5aZJQ9jIA65xwbOxERRUR/AudzNFZUsbay3YhevYPqcpss37ljU8SS7R+l/kczI8ZAP2SIPxFIuthwEeDaLOpodO2cS1XVj1OKZjGEMDSzOPS+sjh2IXKuOOmOnb0GFm6DW4J3JfttIEkt1moWW2b5ugFAekDybSblTTM25qS/YsZucY4xMDIDd+Yp/6Jmkc8yfY5xBICq52uJM4UqECcvRHRCMIuoelT9jKjMyRvpILdlRuPJKd8Lmz0zlm61uHOvRVb0OmbsPD6drAW/YGH5Fe1PPbYaBykkrNWbvO8MWK8fOBABpb53yIfLPndXnzpIePDomDdf+qSLR4hzCtJU8OSBKOizP66vR/y+Ux33EnBN71P5DQllVXyQma9lAAAAAElFTkSuQmCC',
        left: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB4ElEQVR4nH2SvWtUURDFf3Pf24+siYkYFLRRizSaSiVi7V9g7b9hpSgogmIhipVbC0IwQrTQRgQ/CiMxCbsgxi9iIMHGENndrG/vPRZv3+atbDIwMHM4Z+65946xc1SByW791cwuSNIufIiiCOASFB8z/71FU2JTor7miSpPgKtdzgAxgCtdZ2lVSGmG4AnB9/r6uijsuRlh/WLnHLjyFea+CO8TOp12T5Rlp9PG+4TlX6JYuuGcS8VmBnCRd3VNe5/U8id284Okl5kj7xNq6wIu501Mz/xck/c+kaRaTvxc2/FUSh2G4IFnABQKDtzehzYksc8nG5spuefgqDRyJMUa2YBEwsrTUeqeO7z/1uBk8CBtbXSJWQ5LVNIBH/OPu7jSAB4AvOZ3Cs5sSZv/P56kuSDV81gInqYEzMdAky0Po47zpcFffNoGgH8BaDnAMLfDau0S6m5ArwSQQj9JYSCWC9ebJgUsZyXrzVyfqL/vOGCUYQPnYianPrP8J2M6Dh5eYv+BBXx38GoTTkx9wrmYIQDGAG7zttbgzLlXDsqMjV9j4UebieOzBpGBcWziEYsrLcYP3SpCiVNnX/BmqQHcJ45jKJTvAiMAzswwqwLF7XtaDK5q2ZWhgovvRVHMP7z+WsD4PpRYAAAAAElFTkSuQmCC',
        right: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB1klEQVR4nI2Tu4tTURDGf2fOvUlMcAXjigpZFfGBlaAI+h/4T9nYCClslFiJLlhZbJXCJmyxrs91bdyXYLFE8UGURaImN3PG4t6blxH8YIr5+OabOXPOcUzBpeECPAAuZnRb4FqAMK2fgPce4Aa+2GTjY5dgRt+M9m9lbv4xcDuOvZtdDEixXOf9F8MsjRCUEHSYf1KjWrvv00GnEJdusvPNUE1QTYZFeagmDAY92j+NucP3GJo4l4799msqCkFbZrY7bWBmr0LQF6oJux3Dx3dlrP8SGhTVpGkjPBsrXs84VU2e7CUKPAVAxDl86RH9dMxOJtx/0ozKyCAHhzQBM/yJ5ShCABbZ+NDLl7WcCavHzCiNDLYzXiIzjgdlM+lRLLYAXrOXbTwTr5rZ1owd7JjZio1pkU4EdOlPXsjVf7yTM9OEoyuAzLrV/4KJyAQRwuCvfBY3BgECBpgFRKKRe5aLRJiFCS7P0YEAB6kAIhHnLq+z+TkzcMKR2nP2lVf47tJJOwPh7IU1yBtZFaBO680PLl1pFqBA5cB1Xm73OH1+qQBeAOaPNlh794vawp0CxCycWmR1q0up8pBsDXVwZUi/MtAACvlpXHrUhkTiMyoCbvk4dn8AgDJfwO8SCRMAAAAASUVORK5CYII='
    },
    clyde: {
        up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACj0lEQVR4nG2TT2hUVxSHv3PunZfJm5CMiSGSaigxUDSIFv9sutBNQSiuCl1YpO2iUdAiFURKRSUBiyC6EFEsLrJQEHHdlXShiwYpVVBQpJuaVkZDdDI248x7954u5llH8MCFy3fO+fG799wrvCfUJxLz9mXgwwL97rw/HPL8feVvw3sPcLwPrv8z1W92ELPvscdfpS2Fq8BBEXmnR7q3vdjJh1OjP4wNLmMjLyOlItNGWRjk7t8pH8/OHxKRs2bWZVk9Kcw8+Ha97RgN2eRA3rKZCbPTmJ3B7Og2+6Anb32+NmR3vh4JwHfOuUJdBAc//rV/2MLS7YxqDGBmTx+anfdms8O28OcTA7OBiRhC45fszu4+A/aKCN7MCLB1zaARKxt4VRPVAPR+BNEgKzM0vpqXDXAV0RjWtTetaHpg0szwmnjSdv6aDOAplaS/ONhzMMCaQGCgr2M5SE1DVJQQxDk0tvOLj6Yqu2xkIerspx5qQBOubIdmgPoCXPuko5k/wl3amZTWZfHu7upUCOGYBzaMVpZTKxGpPYEL46AlqNc7MwrA/Bz8XIXMYGkJW0EcqzRSYNwD/xIUYgAFGssd69o16AgsFoIFb0UFQlMB/3/CigZfNFuxKNgbMQMRA3CFnoMAMaHzVouiWCaPZXKsYHTVFFYUyLCA9RB1UTyuQ80Ttea8PhdvJSLa4foCHxPymLsIZAoMURa0lvrJs/63xccJpCDzFU1PhptjP9ltedarpPDgj0q+5Vwy5+tpub/8WoEqwIm5L4cbmwfcDSAZ8kzf/2ZVa1S5WNyi29jvbtzbs7qZIgeA8merSrd+/WJlHdiHcw6PnwZ6O/9CRXFnQN/MARHpcXCqC1UVPSIi/AeSmwjoBKJbfAAAAABJRU5ErkJggg==',
        down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACbElEQVR4nHWSu2tUYRDFfzP37t27DzbZyOrGRyISBIPaaKNNChsbKxEEKx9EEEUUUkgKEaKCRAVfUUNasU7tH5BCQaIiEl/EmEgIebnZzd29+41FEl2DDkwz35wz35wzwv/jOrAHqAHTwDnABLCGJr8RIQJmXAJ2vz2ROt65YTmNMyajLDsGS5kqfAKu/YVZN/XK2KncjY6NFWit4ZLEABKj8l31x3yK7QNLdyO4/C+C3s+n833t++diczivTICtdgjUU1QRiN7kgpaBxXsRXGwk6Jk41XSrdd9CLCVUQPHW/c2BGc4yuPKHrJ+7X+o36FnToGvzlrIzAUl6itZXpFtTS4BQEUMtdi5TjB1wCEBX30tSFSURwtmXcGEaCh3gVsG5FrjwaSWbNyHVuqZhcW2DxxPdmSX3IFG3yoj9iWmzJ3mze56ZfWioj5l7lKtXzjdVgGEFDmxpKqcJahB2NixdgIQPosDOhnoHBEbYshACXQosEgs4hegLbXtBUlCerYBfBa8O5Sn8Ngi2AqVxRGOlqgA/FfBRD5yDwaMkPwPLkH5yBOYWIHIweJjMNwi/A0+PQVQBLwBQ/7fKMdjyRzfWW1AsC/IVBzEKWhv1F/raQWLMTToikBUDnA/EmMNCnM4GPvkZYAYDp3PqYx7WVHOSHVc8kPlAXbYaC3UViBVoIanofMbfd9tGZ95nIQCZzWt7n3vVfK02IlN5JQC+ZOm8yWudSvqEYFAAuPPuZHHpYDMvgDAHV8e7i9GuFMOAB0hRGJo4U6xtUx4DQUeCZ+9PFys+PF/zph/INNzdABA0eKfA0CohQAJ4CMgv7wr9rCokR+cAAAAASUVORK5CYII=',
        left: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACk0lEQVR4nGWTT4jVVRTHP+fcM783b97TpzNqjDMaZTCFZBJCbqRN62jbRhGrhWW4axM0BrNIEJpwCoUGghZtbOWmbWoUEU0Jok8xCMU/U6O+p7557917T4vf82V54HsvF77nfr/33HPg/yECqgp8BzQHWEQVEXmCbv85mEmM8dhG9x3XDjVeLcbuGaos/92YnD55Z6qPnDOzj2OM/+o9rt1Qjt9+t3Kw2NCFBriQEZAeShv+vLme50+0jnTUZ8kZAH20roP5y4emDtqLxLyWSA+ki8oqSmHkp0Kc3n4nNg/UPgpZPhw+R0QQmLv+wYyn9Fs/5+XkX25zP0qJb15w97Z793fPx4uUFuhf3DfuwOHHa3Lq6vmfU0qp7+7uvuy+YO6fr3Hv3PJh3P3B+1/Q8fdxYB5ArQhSlyrP7tylYS087AJsgELhxiTS2MTGmYFMYxsSUVxQEDMTjb301aV31r++o+aZh2rBAFqQUpnUg/TIafcaoUPhz3n+dd/42zHGIwo8s3n0pi3NzpBuXaUS2vD1bmglqDfxT/ewcqENqQmLr4GDV8hbK3dHga0GdHCgehn9djskg/v3y/8RQM7C4iT0EjxYLZ1k6PcN6HUMUEShl0tCoIQPsAqsPhhcBqRyF8kAQQFFHQTyGHGYDOQKMVeIQzeAG2UHBYaNFMmOF2RdKUuIlkS9LaYrZj5CxgbKbdQD2aMDJAXWURj6V2EvzY/80vqjBjWQ63VdM8f3W47qT7JSU6pw6UI9v7IwuhRa1aJWcYA6wNzS3on27gk5DVSmRmTuylubO09XWQQVsPDyhJxu7p/o1k0Og1bfmLYfz7y5qQ28h5kRkE9AxgBCCAosgIbhlAmjAp+VUw6g4wKzqso/UZISjmIm/qIAAAAASUVORK5CYII=',
        right: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACkUlEQVR4nG2Sz4uVZRTHP+c8z33vfe+90zg/dEaZULlUEgQa1NZ/wIXQtl8bN2HRJlq4CwRhxDEZBYtpF9QiaSHtWgiioBthwCjMizk23hrTxmruve/7nNPivd7IOnB4OHCew/mezxeeDhEQkRpczODnGqzV4RohBET+2/6vQlXqxnIT27/23tT+fPL3Jm54f8L2Lv157W6yLrXa61YU9j8DVKZFz99/d/JIbfYR5Anq4I6Jo2xmsAm7Tw2//sl4DTAABYgxyjR2vnc0PxI6D0qboySfgj7IAGUI1h6Wtk/LO8f2HH4WLsQQVMaaYal/dNrTMoV/Muvut9y97/7lPvdF3E/ivtJx94ee0kaRFg/4BHyO6nj/r+xDUjpL4eX3Po4/NtzPTbkvB3fvubt7SqnodbsJ9GolPIjOoCqeKSiEDgCNXSDtGbg/A5kDOwAI22Bu7x6dknmyKFE9+YU77zxzyHcNTYcWsZsAtCchA3CHZMA9HCDX2Mlg7f1tr2alX1dgodV8FAlACXx6EMrv2Fh9wODMy9D+ER4DK68g3MW7t7m1+BzN/KYOYCECA0wABwc2H8K5lyBTsGLECfhtHc52KvJhCASMNIgVSq+afAR2kKCf/nHKk/yrgBI8x4SKQTXfq8cyyvEnBWtQWp1ybDcBa45qDzwxkgF4humvWt1CwCOmPaKuS/SAEcADpr+ESI3RwTAFZmmArtfji6fl8r3VFrRAehO64wTfZif8G++2lTps3Z7Q50/rJek2lNxIsB3g+JU35h8fmA4XQbM2fLD65sLWC634BQQFYQ7O/PDWzmJnXZZA4+4GKzfent9qwWeoKlD7CDSvRCkCp5Rq0crtQSK1jzWOvKsaFT0ZY5S/AWqkD0QparkoAAAAAElFTkSuQmCC'
    },
    eyes: {
        up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAj0lEQVR4nO2RsQ7CMAxE79K6aQCJbuztb8Af8P8rX8HaYzCChgbanZ5kyYqezjkb2MR3K02eOUdzJiBwhBCsgPWE7RcmD9YfBsCgp9zdS5Kul/Mpn50z95tzdSkAAKSYZp/7ZDzKF6XYxIUUvw12bbvKAF1VMQCvXUhSydXIjDk2kcDkjL4kF1k+4xrmH/UA3stP0Iur7f8AAAAASUVORK5CYII=',
        down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAm0lEQVR4nO2Ryw3CQAxE35jdEBFRAycEpUAJ9A81EBIlcMjPgazEHUbyxX47I3vhLwBiDDydUpxnQt8zgG2+kQeD1A2cTJo3JIqVzV29jod9NrCX82m3xLRt27wHTYlmY+SjquslRpJ9ZVAmDKC/wf0K0lQAuFtWddn0a88ZgAwoKKx7MdRnShxdF5hAHIc5t+Q3rp2BoRT2c3oBFX9xUA7hwq8AAAAASUVORK5CYII=',
        left: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAuUlEQVR4nO2PvRIBQRCEu+fOIaD8RkoRKCGZwNt4fwKFcutnW2LP1tWdF6CjmdmveruBvxgGSSqOJKvgmEnM6CWYxS7hkYSVbuWdABIC9pTkI2cAeHiv3WazDPsiazWeFczDS0buQQLl0CfnrmHOb10LDHkoJxtV1cXZubyohCyyH36tVuji8vvHwJI6DltMhzNM2jqpUJqmaEdMD8YV5h3l0vHNrAf9zrjV/ARQpLrPYmYBZrWpfkwv2KllZq2VZYMAAAAASUVORK5CYII=',
        right: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAArklEQVR4nO2RsQrCMBCGv0vaUq2gIlJxEBEX6eLi5jv4/g8h0qViIpxT27S0i3M/COTCx5/cBSYAiIxBA8a8IcfEIhiRjmh7tQHi3pkAVnqpIfs4sbX8KIrdmGc6qfJCBETA+XlzZeWc73r1etIJgHXw7KjZV957Btn0A8K+26bf7vMd88izmbnl+UpVtVRVrVSvnJeLICAFkiRu51WqHjlkd05bAC7Gpv9+4wT8AASmiluJhbS5AAAAAElFTkSuQmCC'
    },
    scared: {
        imgDate: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADCklEQVR4nFWSX2hbZRjGf993vnN60qSNXWva6JpR7f5km7qrWrVUXYt2HdOCk2FBoQiDsivxRmU3XggiKIIIuxgOpxeyKsL8A8IoaJVNrMy4Mant2qZbMxKX5k/TmJ6cfJ8Xyao+8PK8F89z8bzPK7gDIcHo+t42GGbwmzk8vwJCIi2HH4d7KfxcAgFCbGkFANIB7cH2l3exc+IVCHfRtn8Mzb/IJ6YQpSxzp94h9enSHY9CyLq5Z3If8ddO0xrrpwr4/B/tDz2PDbj37EW5x1k5PYeQSIyBHcfjxN84QzDWz0a1jNY+1n/MFqC1z0a1TKhnkH0nP2L7xE6MQSAkPH7lPJG9R6j4FXzlstkwBQADlBscAKiWabGbWZ39hJm+lxRGg59PgdFUpdrWDf1xWCvBpV8AG548CIEAXEiAl5aKmtF42RsYgyK4x8EKtSOFZMPo8SfggxfqJ7CPgAjA9Ov1JIffh2/PC0lYSJy2KKHdjmLw0gJN4W48o1FS3S7UxVfSdTYa0lXotKFQAiyp8IxmW98EAz88LBgtpnBaovU6G9kdoAZ4jaKdBnuAbgxAJTuvMEajgHXts1nzcJWLKyQ1YN2vANCqXCRQ1j5ezaNJKlosB6NrEltIbsKJ5zLXrp8rrr44ml1gyWiaSunfPs4tz54p3MAq32bZ6MljxdXr59ZvTR7NJ0kBtrQEQ7nlN09IVS7mkn/mOnp778olH3nw7t1/ZQs3f5q3bNuynIE4tIbc8MU/iqnFW8GOAztKmU3jht869XdOIYRMZyuFzy/H+jO/Ctl1wN+MdRZTiRU7cPbLth4UNDnF1T1dpczZ75vbM4lgZPaxYGSkN30VI6TgUH4FK9xNevpd2iL307J/jIzRmHySyldvo4HmZ08iWu8lIiTFxBS57ArRg6/ip6/C4VKapy9/Rug+m8gzXYzOX2DcGIYSU1uvPHTta8aN4dDcd3Q81U5wl8PI718wkl2A4eRFQg+4W+LosRhH1xZ5dPo9hAJhw8DMh4ytLdI5Ft3ShfuCDC/N/AMdtzXsl7IlxgAAAABJRU5ErkJggg=='
    }
};
/* ───────────── Wall data ───────────── */

const WALLS = {
    horizontal: Array(_shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH + 1)
        .fill(null)
        .map(() => Array(_shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT + 1).fill({ active: false, id: '' })),
    vertical: Array(_shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH + 1)
        .fill(null)
        .map(() => Array(_shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT + 1).fill({ active: false, id: '' }))
};
const setWall = (x, y, direction, lineId, color) => {
    if (direction === 'horizontal') {
        if (x >= 0 && x < WALLS.horizontal.length && y >= 0 && y < WALLS.horizontal[0].length) {
            WALLS.horizontal[x][y] = { active: true, id: lineId, color };
        }
    }
    else {
        if (x >= 0 && x < WALLS.vertical.length && y >= 0 && y < WALLS.vertical[0].length) {
            WALLS.vertical[x][y] = { active: true, id: lineId, color };
        }
    }
};
const hasWall = (x, y, direction) => {
    switch (direction) {
        case 'up':
            return WALLS.horizontal[x][y].active;
        case 'down':
            return WALLS.horizontal[x + 1][y].active;
        case 'left':
            return WALLS.vertical[x][y].active;
        case 'right':
            return WALLS.vertical[x][y + 1].active;
    }
};


/***/ },

/***/ "./src/pacman/core/f1-graphics.ts"
/*!****************************************!*\
  !*** ./src/pacman/core/f1-graphics.ts ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CHECKERED_FLAG_PATTERN: () => (/* binding */ CHECKERED_FLAG_PATTERN),
/* harmony export */   F1_CAR_IMAGES: () => (/* binding */ F1_CAR_IMAGES)
/* harmony export */ });
/* ───────────── F1 Car Images (Base64 Encoded) ───────────── */
// Custom F1 car SVG images for each direction
const F1_CAR_IMAGES = {
    up: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAbEAAAJBCAYAAADIqos1AAAQAElEQVR4AexdBYAd1dX+zsy891biTkjw4BCseKF4Ke5aqGDF3QvBpcWLU9y1eHEpUqj9tNAWh6JxXXkyM//33bezedkkG9vNSuZlvrl+7rnfnTln7p23Lx7ST8pAysBMDHzyySeDhg0b9h4LYsHMXKh4glnlJWVtGQ4fPvz/pA9lpkfKQMpACwZSJ9aCkDSZMiAGampqIoZyXAw69vA8z4SO1SLtPWWgczKQOrHOOS/dW6suMLpisRhSzU7hxKgHqqur5VQVTZEykDJQwUDqxCrISKMpAwkDURR1GgeW6JSGKQMpAzMzkDqxmTlJc1IGEEXOiaWOrPtcC+lIuikDqRPrphObDmvBGIgi58QWTEjaOmUgZaDdGUidWLtTnHbQFRlIv0jRFWct1XlRZKBTO7FFcULSMXcOBpqcmHUObYC6urpOo0tn4STVI2VADKROTCykSBlowUDfvn2tWCw258bxzK/HZpXX3KCNIkEQoFAoWI8ePdpIYiomZaB7MZA6se41n+loFpiBsoCxY8eGdBwze65y8UI7l0ol1NbWhnSYHa7LQht02lHKwDwwkDqxeSArrbrgDNAY2yuvvBL89a9/zXz88ce5zz//vIrxmvfff78H073+8Y9/9PnnP//Z95133unP/AF//vOfB7/xxhtDX3vtteFst9Rzzz239IsvvrjMSy+9tKzwxz/+cbnnn39+xLPPPrvCk08+uaLwhz/8YeWHH354lUcffXTVu+++e7V777139TvuuGPN22677Qc33XTThjfeeOPGDDe9/vrrN7/yyiu3uuaaa7a97LLLdrziiit2ZXznW265ZbtHHnlkv3Hjxg0yM5iVseCjn3cJZgbqMZi6HnDRRRftc/755x94zjnn/PK88877+aWXXnrA5Zdfvi+x51VXXbULdd/xd7/73fbXXXfdtjfccMNWN95442YcyybERhz7+uRg3XvuuWft+++/f60HH3xwDfIz8vHHH1+d4apPPPHEKs8888zK5HdFcUmOlxevb7755rLEkm+99dbiDAdpTjQ3miPGe2vevvrqq2rOXY7pDOco4Bz7hM37aNMWKQPzzkDqxOads0W2hQwWncTONHRH03kcyfA4GrzjafxOJE4hTqdRHEWjeAGdwCUPPfTQ5TSY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5uuvv85+++13I+jMalpnpB1KtRoTZhRtVmed5jqYUbW2S2mVX1dXlzEzmJXRdtLnSxIvgcrfRZkvGWmjdmagWxujduauE4pve5XMrFmonBiNTLffThxXKuW+/u67xTnwnJnNaFCZZv5CO8zYvxfB8xhZaL12TEf6whAdWaZjek977aoMpE6sq85cB+jNx1Lk8/ksw25taIp1dVWjv/12MTrtTjPOKOr+KwJuJ2aKxaKuL/fNTF5nHXCVp112NQZSJ9bVZmwh61tpSBRvaGio5nux2m+//bbmlVde6ZbvxoqFQm7ixKm9S6WSJXTHjETNKSba64h5SwpOftN7stiPi1U1ocvqhKf5UYnXkvf999/XfvzxxwP/+9//DuUW7rBJkyYN4kq/VxRFbvVLpzY/otM2ixgDvGMWsRF3seGG4extFw3BQhkNt3lcPwonTJgw9NJLL93xd7/73c6vvvrq+pdffvkyd955Zy11WRgm3unR3qf3/vXf3l9+9eWgMGJPnkHOK9K3CLUYEpjddkclba5DivacETcrl2Uz2WhQdc8iC7rFwYefHi+++KJ+NWXnJ5988qQHH3zwvGuvvfayM8444/CJEyf242qM26cV/0VOB47arLW/f+hAxdKumxnwmmNpJGVgNgzoyVhFXJnoj29z//znPw966aWXLn322Wdv/8Mf/vAYndjjW2211WM777zzgzvuuONdu+6666277777teedd96Waje3uOGGG365zz77/Havvfa6jOElBxxwwMXCgQceeInA+KXEb4jLfvrTn17OvCsYv5Lxq5pwNcOrmXdNgn333fea/fbb7yqGVzK8Yv/9979cYPqyfffd/7J99zngsp8fePDlP/v5z67cfd89r/rFIQdd9PijTxzJMQ/VSkArsLjsS4AkRBt+tOpyHciBSa46ERQHcrksvvr6q6WOPuGYi/b/2S8uPvDAg3/zy18efNmBHP8B++9/GcfiwHFfTlTyMQMPLPsd616bgPxcx7zryeH1ijfhWobiTjxexfiVP//5zy9nqD5+w7aX7rPPPldedtllR5e1m7szH3p+sssuu9zOef3Dbrvt9hzTLxIP33rrrZc8/vjjhz799NN783ramSuyzflOzPe8slniHMxdB2mtRZCB6UMuXy3T02ksZWAGBsy4Emna3kmMCreAev/tb39b/N133132zTff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/lTiKBrBiAZvrJmNo4xxlDWe8QnERGISMbkJUxlOE1hv2ixQz7y5Bi1Vg2do8H2rC0ulOu511XlV1XkaXBbRs1GYDn2ZQ+HChIx/oa4uDqqq9LdZXDiWSlSqxG3QksFK5EgIGRaJPFFguQP1dCHTxSbkyVljExoYNrBOAvFVx7R4ncIyB3IwmTqI90mc08ksp/+a1PDKK68ccO211x54ySWXHPHAAw+cyfm84IorrvjtVVdddcXFF1981QUXXHAl5/2SUaNGnfvWW2/9SKswtoVCynFOlrKVlSJlYIEYSJ3YAtGXNqbRdCTQ6DWHiXH65ptvqt94442fvPbaawe88MIL+z/xxBM/p8E7+I477jjy5ptvPuaGG244jobvpN/+9renPP300ztsttlmh9Cx/eQPf/jDto8//vi2zz777LYPP/zwjx999FFhm8cee8yBeVsTWwmPPPLIVglYb+smbMmwGQ899NBWwsx5j271yKOPbXn3nXdsec+992350EOPbPXgAw9u9eCDD27128sv375fv34fa1B0ADBFmqB0U7TdA62Ehgwf/vklF1686x333LnZvffeu9ntt9+62S23/n6z2+643aXvuusuhZuT2y0IhTOA49lcYNkWDBNsyTjH/FCCrciP45K8biOQ761Zx8Xvv//+bTgv2zz55JPb7Lbbboe9884729GBXXr11Vefe91115184403Hn3rrbceTP3081L7s+4BnO+DiaO58h6mbUk6w2a+xGFy7TRnLnKRdMBtwUDqxNqCxVTGDAzIoWnLSF/LHj16NLjCMmHMmDEeDZr/3Xff+dxmCujk/K+//lrbUVUffvhhbrnllvty9913/+tOO+3ksO222/6FBvMvu+yyy7vCzjvv/I7AvD/PCrvuuuvbs8Iee+zxllBZpvQee+z81q677vD2Pj/d56199tmH8V3f3nPPPYkd3t5jz93+07NnjzoZ22RwGlcSX1ihVi5VVVXT9tlz17cO3HffN/bdd883DjzwwGbsy7yf/vSnf1K41157vTkr7Lnnnm8IKiuPu8xHy7j4qeRVXHM+HOds/67SO+yww7u9evX693/+85/e3ELsz7nsRWQ1r5xrN8/jxo0zvjMTfOZn6urqTM5YYxGHgh50FC4sHtN+ui8DqRPr5HNLI6pFgNDJNQVklKgvX9+E7n2HnrSVh6ZPZTyp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hc9AagQWPudpj23AALcSq7hS6pjrV/9Vy5zGEDf9nm7LcFbtkjqujO/jXFh5SoaZhJVlUWVivuLk0dcXZearcdooZWAhM9Cyu1ndFS3rpOmUgU7HQKFQyObz+Ta6fivEmA94TJtHGtZ3AAAQAElEQVRV/H9iczF8OaJKgDKUbhkqT2hNpPu/y1o6J8qTrNbazUeZx7HSgXkTJ05Mv9gxH/ylTTqeAd0ZHa9FqsEiywBXAUbo1zeyDPVfgtQy7EH0mTJlSn+Gg+rq6obW19cvITTFF6cDW5yktcE7sdncAnOz2qICsz4SmS3DptrOSTXF5zaYk+ObWzkt6kVRBN/3A24nDp46deoggZwPnjZt2hBCeQMnT57cb9KkSX3p6PqwrCehedJ8ad6SQbaQnCZTBhYOA+kFuHB4XrR74ehp+PS03+fTTz8d8e9//3urf/7zn4f8/e9/P/PPf/7zRa+//vplL7zwwtXPPvvs9Y8//vhNDz300K233XbbHffee+/tl19++R3XXXfdHVdffbXit59xxhl3nHnmmXe8+OKLO1NsGzgxSlngg6smOaYEYHpWaC5f4A7bTEAQBOD7xYB87nTqqafeIX5PPPHEOy644II7LrvsMse95uKBBx64nXNzy/3333/DH/7wh2uee+65y1599dWL3njjjXPffvvtM/7xj38c8cEHH+zJ+d3iyy+/XGXChAm9OeedZH7ajK5UUCdkIHVinXBSuotKdFC9Hn744TXpjH581113HcT4Jc8888yjdFb3M7yc4ZnPP//88XRgh7/00ksH0ZD+9OWXX96b2J2ObUdi+/fff//H77zzzpY0lpv97W9/2+yjjz7a8sMPP9xi/PjxQ/lerHNSJWdVqZnSQnNe4uSaMzosknDIVdbwv/zlLz+mI/rxv/71r23ee++9rfmQsQ0d1LZvvvnm9n/60592eO2113Z95ZVX9uZc/Yxzdhgd2TEMTyLOZPzSP/7xjzc//fTT93Je73jqqacuoOP7BR3hAWy7fIcNMO242zOQOrFuP8UdN0AavF133333v+y7777PHHDAATcefPDBhxx11FGrnnDCCf341F/Lp/7c2WefnTn//PODSy65xOeqy7vmmmu8m266ye644w7cd9994CoAdH6gUQRXAqDzA40lxo4dO2/vrNqNhsQhtQjltBI0953USTKUTuIdE2Yy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mE/jZlY2NjJCqmpWTitOw+UMo8o++uijPfbdd99rjzvuuMuOPvroSxlesuOOO16y0047XcL4b4499thL9thjj7P333//UdyaWk9tZNQSqC85Lsk1MydXBlRpGT3FzQIa2QCeeTD+UxkREzKyIcNSociFCTxMmlS/1KdfTFrrqaf+2ffBt96qHhVzz40VZnXQYTd6Qa4Us11E2TFXXwLNPuR05GPU46zazm+etWgYMZ1vLCCKvSj8DhoTc2Y+Hnww9vV3VUTN7255aKmPv/hyuHlBYwzLx/CKdIslOrOILYWYYSxpPsdlNr1XM3OOhuXuMCuXeXR2yhDfTXHjfG2y1157ncd5PfuYY465gOGFJ5544vm77rrrubvuuus5u+222zkKf/GLX5z62muv7ZTnS0bJEJpkKNrcn/KE+vp6bSca+e/rKqSnlIE5MODNoTwt7sYM0OFU0wCdQGP0NzqTfxL/2mefff6lcO+9936fDuh9xt8/6KCD3vnTn/60OR2H6Wmd7SAHo1D0mJWNndIJlP/1118PeOedd/b885//fOjbb7/9K4aHE0cwfsSbb7552FtvvfWr559//vgXXnjhJBq5FSjTyWcIGUw5Na36JEtg/wr0LUNUVVVhmWWWiddcc81o3XV/ULfpppv+fbvttrthzz13O/LAA/f90WGHHTbymGOOWeW8885Z9fBjjt5gh532OOzzL78NHnjo8TsvuuySdy8/7fq/v/zjg//xw21/+fdNtv3Z336868F/FbbZ9ZC/7rLvKe+efcllr339zZiVYQEgXyewd42PwcyHyuMyDzMXzi4nuf2ScOZ6PXr3wdjxE0ee89szX9/1gBPe2Xrng/5CHf+21U6H/X3znxz69423OugfV974y78dfdJVfznhtKv+eudtd7/82ef/W/aQQw5fZ9Soc1Y/77yzVzv55BNXPewXv1r5gJ8duAbner2f/OQnu2y22WYXrbvuuh8MGzaslOMLQHGuFViigbjmCsolNWY5GCU0/8w3ztdyf/zjH4/j/B7HOT2Soeb1aM7pccQJnN/jGR737LPPnjFu3LhVNV/JA4lkS5bZdKep+RakBx2Zsd0OP//5z9+nvv9siT333FPX6nu8Nv9yxRVX/IL6pas2EbqIYvZ3zyJKyCI27Mxzzz23wiOPPLLmQw89tBqx6oMPPriqwgceeGAV4dFH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pBM0HC/qnK/+6q9+D759yqtf/eon/cf/+B/d10/E5096xSte8TT8/wx87ffnG7lH3/iyl73s2dynb/rJn/zJb/nRH/3Rb/+BH/iB7+FePo/7+oLv+I7v+DHu8wu53z/xTd/0TS/5+q//+p/lGfgl7tMrnvKUp/zGk570pN/mWfmdr/zKr/wvT3jCE177+Mc//r9/0Rd90es+//M///U333zzG6+66qr38Xxlh/mz5nD7OmwQD2xQM7oktkFvzEYxy8xkZivm8In5VpLM85773Od+6/d///f/+7/6q7/67je/+c0/+Jd/+ZcveMMb3vDC17/+9S/60z/905f8yZ/8yc/98R//8S/90R/90Sv+23/7b7/++7//+7/52te+9lW/93u/958Jlq9+1ate9QckpP9J8PyTl7/85X/6C7/wC3/xcz/3c28mSP4NQfJN0DeCN734xS/+6xe84AV/9/znP/9tP/IjP/IPTr/3e7/3H0h87/G/OLFi2EkKsarm7r9//3YXCezJkczIX8mrKzAzWWSLLFbq856sYDuPTCKNWOyND0D3Kw3vVVzeq3r5Hui9qpf2qlrap/HSASXei/UKyb/+LnkcjhqTCCMrJ99NTKzuauoMLysqjUdH6H+/4vA+xeV7lZb3SZQ12i+N75eqQw3GjI9sisusBCsZCRJLGcikKikfZjKbQqCSG9Z3echDHnLwh3/4h//2Oc95zt84deDnv/7xH//xN/7UT/3UX3Af/P78Mffoj73Mffr/fvmXf/l//tqv/dof/tZv/dbv/c7v/M5vveY1r3nlH/zBH/wa+NU//MM/fMX/+l//6xe4/y973ete9+I///M//wmejR9505ve9EN//dd//QN/+7d/+xwS2ffwHH0nSfKbuZffRML8BpLlc83sE6yys+HrSWLIWBbuLlvWA10S27K3fn0TJ0isCPrWz86dOw887GEPO8wKq3YQdCaRdEVswxV4dzc4cuTIrBvmSWxlTmbiFZXMG4CXA7MxklBQLaWxZENJgC0+YyvRbJG6Ywnq8LYxCaZGT0RfhM/pylqgD87kjHm1F1y/62XbUA70+9ZkA/SylShv512cQEESNN6vBXS5vcEz40TjZiNmlkiGkURWsUIb8hwtsVpb/NIv/dJDPF+HuF95Sv5hIxe6S+eBk3igS2Incc7mbzrlDIyg7jHxpIJt0Pct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',
    down: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAbEAAAJBCAYAAADIqos1AAAQAElEQVR4AexdBYAd1dX+zsy891biTkjw4BCseKF4Ke5aqGDF3QvBpcWLU9y1eHEpUqj9tNAWh6JxXXkyM//33bezedkkG9vNSuZlvrl+7rnfnTln7p23Lx7ST8pAysBMDHzyySeDhg0b9h4LYsHMXKh4glnlJWVtGQ4fPvz/pA9lpkfKQMpACwZSJ9aCkDSZMiAGampqIoZyXAw69vA8z4SO1SLtPWWgczKQOrHOOS/dW6suMLpisRhSzU7hxKgHqqur5VQVTZEykDJQwUDqxCrISKMpAwkDURR1GgeW6JSGKQMpAzMzkDqxmTlJc1IGEEXOiaWOrPtcC+lIuikDqRPrphObDmvBGIgi58QWTEjaOmUgZaDdGUidWLtTnHbQFRlIv0jRFWct1XlRZKBTO7FFcULSMXcOBpqcmHUObYC6urpOo0tn4STVI2VADKROTCykSBlowUDfvn2tWCw258bxzK/HZpXX3KCNIkEQoFAoWI8ePdpIYiomZaB7MZA6se41n+loFpiBsoCxY8eGdBwze65y8UI7l0ol1NbWhnSYHa7LQht02lHKwDwwkDqxeSArrbrgDNAY2yuvvBL89a9/zXz88ce5zz//vIrxmvfff78H073+8Y9/9PnnP//Z95133unP/AF//vOfB7/xxhtDX3vtteFst9Rzzz239IsvvrjMSy+9tKzwxz/+cbnnn39+xLPPPrvCk08+uaLwhz/8YeWHH354lUcffXTVu+++e7V777139TvuuGPN22677Qc33XTThjfeeOPGDDe9/vrrN7/yyiu3uuaaa7a97LLLdrziiit2ZXznW265ZbtHHnlkv3Hjxg0yM5iVseCjn3cJZgbqMZi6HnDRRRftc/755x94zjnn/PK88877+aWXXnrA5Zdfvi+x51VXXbULdd/xd7/73fbXXXfdtjfccMNWN95442YcyybERhz7+uRg3XvuuWft+++/f60HH3xwDfIz8vHHH1+d4apPPPHEKs8888zK5HdFcUmOlxevb7755rLEkm+99dbiDAdpTjQ3miPGe2vevvrqq2rOXY7pDOco4Bz7hM37aNMWKQPzzkDqxOads0W2hQwWncTONHRH03kcyfA4GrzjafxOJE4hTqdRHEWjeAGdwCUPPfTQ5TSY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5uuvv85+++13I+jMalpnpB1KtRoTZhRtVmed5jqYUbW2S2mVX1dXlzEzmJXRdtLnSxIvgcrfRZkvGWmjdmagWxujduauE4pve5XMrFmonBiNTLffThxXKuW+/u67xTnwnJnNaFCZZv5CO8zYvxfB8xhZaL12TEf6whAdWaZjek977aoMpE6sq85cB+jNx1Lk8/ksw25taIp1dVWjv/12MTrtTjPOKOr+KwJuJ2aKxaKuL/fNTF5nHXCVp112NQZSJ9bVZmwh61tpSBRvaGio5nux2m+//bbmlVde6ZbvxoqFQm7ixKm9S6WSJXTHjETNKSba64h5SwpOftN7stiPi1U1ocvqhKf5UYnXkvf999/XfvzxxwP/+9//DuUW7rBJkyYN4kq/VxRFbvVLpzY/otM2ixgDvGMWsRF3seGG4extFw3BQhkNt3lcPwonTJgw9NJLL93xd7/73c6vvvrq+pdffvkyd955Zy11WRgm3unR3qf3/vXf3l9+9eWgMGJPnkHOK9K3CLUYEpjddkclba5DivacETcrl2Uz2WhQdc8iC7rFwYefHi+++KJ+NWXnJ5988qQHH3zwvGuvvfayM8444/CJEyf242qM26cV/0VOB47arLW/f+hAxdKumxnwmmNpJGVgNgzoyVhFXJnoj29z//znPw966aWXLn322Wdv/8Mf/vAYndjjW2211WM777zzgzvuuONdu+6666277777teedd96Waje3uOGGG365zz77/Havvfa6jOElBxxwwMXCgQceeInA+KXEb4jLfvrTn17OvCsYv5Lxq5pwNcOrmXdNgn333fea/fbb7yqGVzK8Yv/9979cYPqyfffd/7J99zngsp8fePDlP/v5z67cfd89r/rFIQdd9PijTxzJMQ/VSkArsLjsS4AkRBt+tOpyHciBSa46ERQHcrksvvr6q6WOPuGYi/b/2S8uPvDAg3/zy18efNmBHP8B++9/GcfiwHFfTlTyMQMPLPsd616bgPxcx7zryeH1ijfhWobiTjxexfiVP//5zy9nqD5+w7aX7rPPPldedtllR5e1m7szH3p+sssuu9zOef3Dbrvt9hzTLxIP33rrrZc8/vjjhz799NN783ramSuyzflOzPe8slniHMxdB2mtRZCB6UMuXy3T02ksZWAGBsy4Emna3kmMCreAev/tb39b/N133132zTff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/lTiKBrBiAZvrJmNo4xxlDWe8QnERGISMbkJUxlOE1hv2ixQz7y5Bi1Vg2do8H2rC0ulOu511XlV1XkaXBbRs1GYDn2ZQ+HChIx/oa4uDqqq9LdZXDiWSlSqxG3QksFK5EgIGRaJPFFguQP1dCHTxSbkyVljExoYNrBOAvFVx7R4ncIyB3IwmTqI90mc08ksp/+a1PDKK68ccO211x54ySWXHPHAAw+cyfm84IorrvjtVVdddcXFF1981QUXXHAl5/2SUaNGnfvWW2/9SKswtoVCynFOlrKVlSJlYIEYSJ3YAtGXNqbRdCTQ6DWHiXH65ptvqt94442fvPbaawe88MIL+z/xxBM/p8E7+I477jjy5ptvPuaGG244jobvpN/+9renPP300ztsttlmh9Cx/eQPf/jDto8//vi2zz777LYPP/zwjx999FFhm8cee8yBeVsTWwmPPPLIVglYb+smbMmwGQ899NBWwsx5j271yKOPbXn3nXdsec+992350EOPbPXgAw9u9eCDD27128sv375fv34fa1B0ADBFmqB0U7TdA62Ehgwf/vklF1686x333LnZvffeu9ntt9+62S23/n6z2+643aXvuusuhZuT2y0IhTOA49lcYNkWDBNsyTjH/FCCrciP45K8biOQ761Zx8Xvv//+bTgv2zz55JPb7Lbbboe9884729GBXXr11Vefe91115184403Hn3rrbceTP3081L7s+4BnO+DiaO58h6mbUk6w2a+xGFy7TRnLnKRdMBtwUDqxNqCxVTGDAzIoWnLSF/LHj16NLjCMmHMmDEeDZr/3Xff+dxmCujk/K+//lrbUVUffvhhbrnllvty9913/+tOO+3ksO222/6FBvMvu+yyy7vCzjvv/I7AvD/PCrvuuuvbs8Iee+zxllBZpvQee+z81q677vD2Pj/d56199tmH8V3f3nPPPYkd3t5jz93+07NnjzoZ22RwGlcSX1ihVi5VVVXT9tlz17cO3HffN/bdd883DjzwwGbsy7yf/vSnf1K41157vTkr7Lnnnm8IKiuPu8xHy7j4qeRVXHM+HOds/67SO+yww7u9evX693/+85/e3ELsz7nsRWQ1r5xrN8/jxo0zvjMTfOZn6urqTM5YYxGHgh50FC4sHtN+ui8DqRPr5HNLI6pFgNDJNQVklKgvX9+E7n2HnrSVh6ZPZTyp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hc9AagQWPudpj23AALcSq7hS6pjrV/9Vy5zGEDf9nm7LcFbtkjqujO/jXFh5SoaZhJVlUWVivuLk0dcXZearcdooZWAhM9Cyu1ndFS3rpOmUgU7HQKFQyObz+Ta6fivEmA94TJtHGtZ3AAAQAElEQVRV/H9iczF8OaJKgDKUbhkqT2hNpPu/y1o6J8qTrNbazUeZx7HSgXkTJ05Mv9gxH/ylTTqeAd0ZHa9FqsEiywBXAUbo1zeyDPVfgtQy7EH0mTJlSn+Gg+rq6obW19cvITTFF6cDW5yktcE7sdncAnOz2qICsz4SmS3DptrOSTXF5zaYk+ObWzkt6kVRBN/3A24nDp46deoggZwPnjZt2hBCeQMnT57cb9KkSX3p6PqwrCehedJ8ad6SQbaQnCZTBhYOA+kFuHB4XrR74ehp+PS03+fTTz8d8e9//3urf/7zn4f8/e9/P/PPf/7zRa+//vplL7zwwtXPPvvs9Y8//vhNDz300K233XbbHffee+/tl19++R3XXXfdHVdffbXit59xxhl3nHnmmXe8+OKLO1NsGzgxSlngg6smOaYEYHpWaC5f4A7bTEAQBOD7xYB87nTqqafeIX5PPPHEOy644II7LrvsMse95uKBBx64nXNzy/3333/DH/7wh2uee+65y1599dWL3njjjXPffvvtM/7xj38c8cEHH+zJ+d3iyy+/XGXChAm9OeedZH7ajK5UUCdkIHVinXBSuotKdFC9Hn744TXpjH581113HcT4Jc8888yjdFb3M7yc4ZnPP//88XRgh7/00ksH0ZD+9OWXX96b2J2ObUdi+/fff//H77zzzpY0lpv97W9/2+yjjz7a8sMPP9xi/PjxQ/lerHNSJWdVqZnSQnNe4uSaMzosknDIVdbwv/zlLz+mI/rxv/71r23ee++9rfmQsQ0d1LZvvvnm9n/60592eO2113Z95ZVX9uZc/Yxzdhgd2TEMTyLOZPzSP/7xjzc//fTT93Je73jqqacuoOP7BR3hAWy7fIcNMO242zOQOrFuP8UdN0AavF133333v+y7777PHHDAATcefPDBhxx11FGrnnDCCf341F/Lp/7c2WefnTn//PODSy65xOeqy7vmmmu8m266ye644w7cd9994CoAdH6gUQRXAqDzA40lxo4dO2/vrNqNhsQhtQjltBI0953USTKUTuIdE2Yy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mE/jZlY2NjJCqmpWTitOw+UMo8o++uijPfbdd99rjzvuuMuOPvroSxlesuOOO16y0047XcL4b4499thL9thjj7P333//UdyaWk9tZNQSqC85Lsk1MydXBlRpGT3FzQIa2QCeeTD+UxkREzKyIcNSociFCTxMmlS/1KdfTFrrqaf+2ffBt96qHhVzz40VZnXQYTd6Qa4Us11E2TFXXwLNPuR05GPU46zazm+etWgYMZ1vLCCKvSj8DhoTc2Y+Hnww9vV3VUTN7255aKmPv/hyuHlBYwzLx/CKdIslOrOILYWYYSxpPsdlNr1XM3OOhuXuMCuXeXR2yhDfTXHjfG2y1157ncd5PfuYY465gOGFJ5544vm77rrrubvuuus5u+222zkKf/GLX5z62muv7ZTnS0bJEJpkKNrcn/KE+vp6bSca+e/rKqSnlIE5MODNoTwt7sYM0OFU0wCdQGP0NzqTfxL/2mefff6lcO+9936fDuh9xt8/6KCD3vnTn/60OR2H6Wmd7SAHo1D0mJWNndIJlP/1118PeOedd/b885//fOjbb7/9K4aHE0cwfsSbb7552FtvvfWr559//vgXXnjhJBq5FSjTyWcIGUw5Na36JEtg/wr0LUNUVVVhmWWWiddcc81o3XV/ULfpppv+fbvttrthzz13O/LAA/f90WGHHTbymGOOWeW8885Z9fBjjt5gh532OOzzL78NHnjo8TsvuuySdy8/7fq/v/zjg//xw21/+fdNtv3Z336868F/FbbZ9ZC/7rLvKe+efcllr339zZiVYQEgXyewd42PwcyHyuMyDzMXzi4nuf2ScOZ6PXr3wdjxE0ee89szX9/1gBPe2Xrng/5CHf+21U6H/X3znxz69423OugfV974y78dfdJVfznhtKv+eudtd7/82ef/W/aQQw5fZ9Soc1Y/77yzVzv55BNXPewXv1r5gJ8duAbner2f/OQnu2y22WYXrbvuuh8MGzaslOMLQHGuFViigbjmCsolNWY5GCU0/8w3ztdyf/zjH4/j/B7HOT2Soeb1aM7pccQJnN/jGR737LPPnjFu3LhVNV/JA4lkS5bZdKep+RakBx2Zsd0OP//5z9+nvv9siT333FPX6nu8Nv9yxRVX/IL6pas2EbqIYvZ3zyJKyCI27Mxzzz23wiOPPLLmQw89tBqx6oMPPriqwgceeGAV4dFH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pBM0HC/qnK/+6q9+D759yqtf/eon/cf/+B/d10/E5096xSte8TT8/wx87ffnG7lH3/iyl73s2dynb/rJn/zJb/nRH/3Rb/+BH/iB7+FePo/7+oLv+I7v+DHu8wu53z/xTd/0TS/5+q//+p/lGfgl7tMrnvKUp/zGk570pN/mWfmdr/zKr/wvT3jCE177+Mc//r9/0Rd90es+//M///U333zzG6+66qr38Xxlh/mz5nD7OmwQD2xQM7oktkFvzEYxy8xkZivm8In5VpLM85773Od+6/d///f/+7/6q7/67je/+c0/+Jd/+ZcveMMb3vDC17/+9S/60z/905f8yZ/8yc/98R//8S/90R/90Sv+23/7b7/++7//+7/52te+9lW/93u/958Jlq9+1ate9QckpP9J8PyTl7/85X/6C7/wC3/xcz/3c28mSP4NQfJN0DeCN734xS/+6xe84AV/9/znP/9tP/IjP/IPTr/3e7/3H0h87/G/OLFi2EkKsarm7r9//3YXCezJkczIX8mrKzAzWWSLLFbq856sYDuPTCKNWOyND0D3Kw3vVVzeq3r5Hui9qpf2qlrap/HSASXei/UKyb/+LnkcjhqTCCMrJ99NTKzuauoMLysqjUdH6H+/4vA+xeV7lZb3SZQ12i+N75eqQw3GjI9sisusBCsZCRJLGcikKikfZjKbQqCSG9Z3echDHnLwh3/4h//2Oc95zt84deDnv/7xH//xN/7UT/3UX3Af/P78Mffoj73Mffr/fvmXf/l//tqv/dof/tZv/dbv/c7v/M5vveY1r3nlH/zBH/wa+NU//MM/fMX/+l//6xe4/y973ete9+I///M//wmejR9505ve9EN//dd//QN/+7d/+xwS2ffwHH0nSfKbuZffRML8BpLlc83sE6yys+HrSWLIWBbuLlvWA10S27K3fn0TJ0isCPrWz86dOw887GEPO8wKq3YQdCaRdEVswxV4dzc4cuTIrBvmSWxlTmbiFZXMG4CXA7MxklBQLaWxZENJgC0+YyvRbJG6Ywnq8LYxCaZGT0RfhM/pylqgD87kjHm1F1y/62XbUA70+9ZkA/SylShv512cQEESNN6vBXS5vcEz40TjZiNmlkiGkURWsUIb8hwtsVpb/NIv/dJDPF+HuF95Sv5hIxe6S+eBk3igS2Incc7mbzrlDIyg7jHxpIJt0Pct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',
    left: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAbEAAAJBCAYAAADIqos1AAAQAElEQVR4AexdBYAd1dX+zsy891biTkjw4BCseKF4Ke5aqGDF3QvBpcWLU9y1eHEpUqj9tNAWh6JxXXkyM//33bezedkkG9vNSuZlvrl+7rnfnTln7p23Lx7ST8pAysBMDHzyySeDhg0b9h4LYsHMXKh4glnlJWVtGQ4fPvz/pA9lpkfKQMpACwZSJ9aCkDSZMiAGampqIoZyXAw69vA8z4SO1SLtPWWgczKQOrHOOS/dW6suMLpisRhSzU7hxKgHqqur5VQVTZEykDJQwUDqxCrISKMpAwkDURR1GgeW6JSGKQMpAzMzkDqxmTlJc1IGEEXOiaWOrPtcC+lIuikDqRPrphObDmvBGIgi58QWTEjaOmUgZaDdGUidWLtTnHbQFRlIv0jRFWct1XlRZKBTO7FFcULSMXcOBpqcmHUObYC6urpOo0tn4STVI2VADKROTCykSBlowUDfvn2tWCw258bxzK/HZpXX3KCNIkEQoFAoWI8ePdpIYiomZaB7MZA6se41n+loFpiBsoCxY8eGdBwze65y8UI7l0ol1NbWhnSYHa7LQht02lHKwDwwkDqxeSArrbrgDNAY2yuvvBL89a9/zXz88ce5zz//vIrxmvfff78H073+8Y9/9PnnP//Z95133unP/AF//vOfB7/xxhtDX3vtteFst9Rzzz239IsvvrjMSy+9tKzwxz/+cbnnn39+xLPPPrvCk08+uaLwhz/8YeWHH354lUcffXTVu+++e7V777139TvuuGPN22677Qc33XTThjfeeOPGDDe9/vrrN7/yyiu3uuaaa7a97LLLdrziiit2ZXznW265ZbtHHnlkv3Hjxg0yM5iVseCjn3cJZgbqMZi6HnDRRRftc/755x94zjnn/PK88877+aWXXnrA5Zdfvi+x51VXXbULdd/xd7/73fbXXXfdtjfccMNWN95442YcyybERhz7+uRg3XvuuWft+++/f60HH3xwDfIz8vHHH1+d4apPPPHEKs8888zK5HdFcUmOlxevb7755rLEkm+99dbiDAdpTjQ3miPGe2vevvrqq2rOXY7pDOco4Bz7hM37aNMWKQPzzkDqxOads0W2hQwWncTONHRH03kcyfA4GrzjafxOJE4hTqdRHEWjeAGdwCUPPfTQ5TSY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5uuvv85+++13I+jMalpnpB1KtRoTZhRtVmed5jqYUbW2S2mVX1dXlzEzmJXRdtLnSxIvgcrfRZkvGWmjdmagWxujduauE4pve5XMrFmonBiNTLffThxXKuW+/u67xTnwnJnNaFCZZv5CO8zYvxfB8xhZaL12TEf6whAdWaZjek977aoMpE6sq85cB+jNx1Lk8/ksw25taIp1dVWjv/12MTrtTjPOKOr+KwJuJ2aKxaKuL/fNTF5nHXCVp112NQZSJ9bVZmwh61tpSBRvaGio5nux2m+//bbmlVde6ZbvxoqFQm7ixKm9S6WSJXTHjETNKSba64h5SwpOftN7stiPi1U1ocvqhKf5UYnXkvf999/XfvzxxwP/+9//DuUW7rBJkyYN4kq/VxRFbvVLpzY/otM2ixgDvGMWsRF3seGG4extFw3BQhkNt3lcPwonTJgw9NJLL93xd7/73c6vvvrq+pdffvkyd955Zy11WRgm3unR3qf3/vXf3l9+9eWgMGJPnkHOK9K3CLUYEpjddkclba5DivacETcrl2Uz2WhQdc8iC7rFwYefHi+++KJ+NWXnJ5988qQHH3zwvGuvvfayM8444/CJEyf242qM26cV/0VOB47arLW/f+hAxdKumxnwmmNpJGVgNgzoyVhFXJnoj29z//znPw966aWXLn322Wdv/8Mf/vAYndjjW2211WM777zzgzvuuONdu+6666277777teedd96Waje3uOGGG365zz77/Havvfa6jOElBxxwwMXCgQceeInA+KXEb4jLfvrTn17OvCsYv5Lxq5pwNcOrmXdNgn333fea/fbb7yqGVzK8Yv/9979cYPqyfffd/7J99zngsp8fePDlP/v5z67cfd89r/rFIQdd9PijTxzJMQ/VSkArsLjsS4AkRBt+tOpyHciBSa46ERQHcrksvvr6q6WOPuGYi/b/2S8uPvDAg3/zy18efNmBHP8B++9/GcfiwHFfTlTyMQMPLPsd616bgPxcx7zryeH1ijfhWobiTjxexfiVP//5zy9nqD5+w7aX7rPPPldedtllR5e1m7szH3p+sssuu9zOef3Dbrvt9hzTLxIP33rrrZc8/vjjhz799NN783ramSuyzflOzPe8slniHMxdB2mtRZCB6UMuXy3T02ksZWAGBsy4Emna3kmMCreAev/tb39b/N133132zTff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/lTiKBrBiAZvrJmNo4xxlDWe8QnERGISMbkJUxlOE1hv2ixQz7y5Bi1Vg2do8H2rC0ulOu511XlV1XkaXBbRs1GYDn2ZQ+HChIx/oa4uDqqq9LdZXDiWSlSqxG3QksFK5EgIGRaJPFFguQP1dCHTxSbkyVljExoYNrBOAvFVx7R4ncIyB3IwmTqI90mc08ksp/+a1PDKK68ccO211x54ySWXHPHAAw+cyfm84IorrvjtVVdddcXFF1981QUXXHAl5/2SUaNGnfvWW2/9SKswtoVCynFOlrKVlSJlYIEYSJ3YAtGXNqbRdCTQ6DWHiXH65ptvqt94442fvPbaawe88MIL+z/xxBM/p8E7+I477jjy5ptvPuaGG244jobvpN/+9renPP300ztsttlmh9Cx/eQPf/jDto8//vi2zz777LYPP/zwjx999FFhm8cee8yBeVsTWwmPPPLIVglYb+smbMmwGQ899NBWwsx5j271yKOPbXn3nXdsec+992350EOPbPXgAw9u9eCDD27128sv375fv34fa1B0ADBFmqB0U7TdA62Ehgwf/vklF1686x333LnZvffeu9ntt9+62S23/n6z2+643aXvuusuhZuT2y0IhTOA49lcYNkWDBNsyTjH/FCCrciP45K8biOQ761Zx8Xvv//+bTgv2zz55JPb7Lbbboe9884729GBXXr11Vefe91115184403Hn3rrbceTP3081L7s+4BnO+DiaO58h6mbUk6w2a+xGFy7TRnLnKRdMBtwUDqxNqCxVTGDAzIoWnLSF/LHj16NLjCMmHMmDEeDZr/3Xff+dxmCujk/K+//lrbUVUffvhhbrnllvty9913/+tOO+3ksO222/6FBvMvu+yyy7vCzjvv/I7AvD/PCrvuuuvbs8Iee+zxllBZpvQee+z81q677vD2Pj/d56199tmH8V3f3nPPPYkd3t5jz93+07NnjzoZ22RwGlcSX1ihVi5VVVXT9tlz17cO3HffN/bdd883DjzwwGbsy7yf/vSnf1K41157vTkr7Lnnnm8IKiuPu8xHy7j4qeRVXHM+HOds/67SO+yww7u9evX693/+85/e3ELsz7nsRWQ1r5xrN8/jxo0zvjMTfOZn6urqTM5YYxGHgh50FC4sHtN+ui8DqRPr5HNLI6pFgNDJNQVklKgvX9+E7n2HnrSVh6ZPZTyp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hc9AagQWPudpj23AALcSq7hS6pjrV/9Vy5zGEDf9nm7LcFbtkjqujO/jXFh5SoaZhJVlUWVivuLk0dcXZearcdooZWAhM9Cyu1ndFS3rpOmUgU7HQKFQyObz+Ta6fivEmA94TJtHGtZ3AAAQAElEQVRV/H9iczF8OaJKgDKUbhkqT2hNpPu/y1o6J8qTrNbazUeZx7HSgXkTJ05Mv9gxH/ylTTqeAd0ZHa9FqsEiywBXAUbo1zeyDPVfgtQy7EH0mTJlSn+Gg+rq6obW19cvITTFF6cDW5yktcE7sdncAnOz2qICsz4SmS3DptrOSTXF5zaYk+ObWzkt6kVRBN/3A24nDp46deoggZwPnjZt2hBCeQMnT57cb9KkSX3p6PqwrCehedJ8ad6SQbaQnCZTBhYOA+kFuHB4XrR74ehp+PS03+fTTz8d8e9//3urf/7zn4f8/e9/P/PPf/7zRa+//vplL7zwwtXPPvvs9Y8//vhNDz300K233XbbHffee+/tl19++R3XXXfdHVdffbXit59xxhl3nHnmmXe8+OKLO1NsGzgxSlngg6smOaYEYHpWaC5f4A7bTEAQBOD7xYB87nTqqafeIX5PPPHEOy644II7LrvsMse95uKBBx64nXNzy/3333/DH/7wh2uee+65y1599dWL3njjjXPffvvtM/7xj38c8cEHH+zJ+d3iyy+/XGXChAm9OeedZH7ajK5UUCdkIHVinXBSuotKdFC9Hn744TXpjH581113HcT4Jc8888yjdFb3M7yc4ZnPP//88XRgh7/00ksH0ZD+9OWXX96b2J2ObUdi+/fff//H77zzzpY0lpv97W9/2+yjjz7a8sMPP9xi/PjxQ/lerHNSJWdVqZnSQnNe4uSaMzosknDIVdbwv/zlLz+mI/rxv/71r23ee++9rfmQsQ0d1LZvvvnm9n/60592eO2113Z95ZVX9uZc/Yxzdhgd2TEMTyLOZPzSP/7xjzc//fTT93Je73jqqacuoOP7BR3hAWy7fIcNMO242zOQOrFuP8UdN0AavF133333v+y7777PHHDAATcefPDBhxx11FGrnnDCCf341F/Lp/7c2WefnTn//PODSy65xOeqy7vmmmu8m266ye644w7cd9994CoAdH6gUQRXAqDzA40lxo4dO2/vrNqNhsQhtQjltBI0953USTKUTuIdE2YyGXA7EePGjcO7774LPkCADxaO5yeeeALCo48+Cj6I2O23326cG+93v/udT+cUXHzxxZlzzz03e9ZZZ1VxPms4r72OPvroQYcddtjanO8jOO83nnTSSbfSwe3WAaNLu1xEGEid2CIy0R0xTL5LCczMJ3SAp5nQUi9uQelnkKBQqCzX+5sknchK0p0/bOmwWqY7ZgTFYtHxrS94SIMkVFz8i3O+L3N1lFZ+a0jmRaHqs71fW1tbaq1NWpYysCAMpE5sQdhL27bKQN++fUMZstYgY5dgVsK0ShAqy2RUlaaBVNDB0C0kJGooLiTpJFSeMLt0kr/wQ81PwmXCreZkdpqoLMHs6lTm5/mpTKfxlIG2ZKDyrmpLufMlK23UvRhIDGJro5IBTSDDqJWAoLjaSUZiYJWXODTVUXnngW4lYU4aJXWScE7127dcnKoHzUESV7oyrnQlVDeB8ivrJvkKVaYvjnCuOseyUwql6HYMdI47qdvRmg5IDJRKpVjhvEAOS0iMoNomcYVyaspLQsXbAp7uBKMk/exURJtrSjDd2hF7iFkV+vut2GAMBTAuqExpQelmsJ7iLl9xzP6jMauUjgCBFyBJO2dOHZVvZqoyX0jkqXFlXHOgvLmRX9lObRIoX/NEXef5OkhkpGHKwJwY0K07pzppecrAfDFQVVUFM4MMoWA2s7GlgXPl4EdGj0HzYTZz/ebCeYiYmdPDzGZqZTDnGOS3VOgHAVgZCEOXj7n4yFnFFBCxjZCMw8ygtKC8BHJgEqu0wtagL16oPCoVUYpKiPnPpdkfX1RRzZCB86TKdjAzDsFcfEFPcmbS08ycTLMZw0r5ZuUyzbXmVaswtWV8RgUrG6XxlIEFZCB1YgtIYNp89gwUCgX3TkyGUJBBa1lbT+oqS/LNyoZQ6VnVV/68QnISmJlzmjSsEMCPjC4DyD84XbQaY71sNuuyWzsFvg9BsiTH8ww8YBQmuDQz/CaorkfZgplhTh9yCK5oAfOglVgmyCAIPJiV25qZi5tND5Oxoh0+iewkrOwiyROHmlfpbUYWVFBZMY2nDLQhA14bykpFpQzMwICZhTNkVCRY5oxvRZaLyt4JLtEGJ8+b8RKX7MTIytBqZVN2QOXOVE7vBipXdh5o/SNDHYZcIcnx0XGVa0dcHZUc0PRHz3FcXjGpbhSV49JD38Ivt5n1WY5UKxqfK8SQ7YpakZUitwKTjtI3gSSIV405gfIWBJKn9pV9KJ1A5QmSvMpQ7cIwTFdilaQASJNtx8CMd3jbyU0lpQyABjianYGTcRPkQAQZ3ZaUzSqvZZ05peUoKutIZgLpprLy18wVA1c5ATzfhxyEHBRa+1ikaqwRETHjZXhsHmQ8COYxj4Cryzi9lhGeZ+zHUHZyDGZzSIeyfhFdZOxqeZ4LwA55SAbcR3xqvJVwBW14quROcfWZIOlGvAoqVx7DsuJKpEgZaGMGktuhjcWm4lIGgHw+T/sWz/BuScZNoGFzBphP6W5VwYpI8lQu/pSnsK0guYLkydBLvmfTbwHPN5T0d1OFgqqgurraha2dtLXnB3QkxpVXXEIY8d1VqcAxFbkSE5ivd1lcicUo0hFxcUqHBtaHW6W1Jh1cFPqOv0Rvj/pqZeZa8b2Y8gWlFYpDwacjVqj8toLkqY+EO4VKJ0j6Ea+KJyH1TZ2YCEnRLgxMv4PbRXw3EpoOZZ4ZqKurGy4DN6uGMnBCYhhVR3UT46u4ypW/IJA8yZIMyZPhVbwyT2mtbpI8pRWfOnWqoq2i7ITpnOikADooBznuCBGdWhxHdELllRrowkDHFdGphXR0UWnOfwOc6CuepEhEecUi27ntS0qjI4ub4gpVX5BeCtWmrSD5kpvI05dOlJcgyRd3iisUPv/88yWVTpEy0B4MpE6sPVjtpjJffPHFwWeddda5p5566qjzzz//TIanEWccc8wxZx511FFnHX744ecfcsghl/70pz+96tBDD73xvffe2/QHP/jBa2uvvfbf11hjjf+sttpqX6y00krfLr/88mOWXXbZ8csss8zExRZbbHKfPn3q+bQeyUBq+0zGV8avLWiULBlZyeP2Zty3b9/G4cOXHL/iiiuNHTlyzc/XGDnyb2usMfJV6vnoD9Zd994NNt7gri222erWH6yz1n29evWaYHQ83P2bURWupGKXWV5gUHfUVgfo0zODgX2rMKhfDgP6ZdG/Tw59enno29tHv97mwj69fPTsEaCqugqZXAaVH7k6uqWmLMqmwxInAwcMmLD2Omvev/nmm9+3+eZb3L/JJpvev866P3h83fXWf22ttdd9Z+Qaa3+wyiqrfbv0csuOHzp0aH3v3r1jjrVJzoIF4q6lBHFZU1MTct7qOIfTOJdTR4wYMXnFFVecuMoqq4znPI/nfI9Zc801Pyev73z66ac/3GeffR7acccd7/7FL37xu4MOOuhS4oLjjjvurKOPPvq0UaNGnXjGGWccf+aZZ55y7LHH/kK/udmyzzSdMjA7BlInNjtm0vyZGPjwww9XPvfcc8+8+OKLz6YzO4/hhZdccsn5V1111XnXXHPNOdddd90ZN91000l333330TfeeOMhdEjfst4up5xyyna//vWvtz777LO3YHyzk046aQtiOxqsvWnEfnHOOeecSIP4Pjuk5QYymQzkfJLVB/Nnexg8CGBYBsofY0BwTQTw/VMmW4VCodSw+ZZbX3zppb/d6dRTz9zyvPMu3uI3l127zT/+8fct3nnnL7v9+c0/7/f2G3864KXn/vDLW2946GeDBvb/v1CrHq52ZLiNIuFWXFwJgduE2h5UZhihJhtjcN8MFusHDOodYnCfCEP6mEsP6RtiQM8C80oY2Dumo8tR5zy3HEOGcAA/+vOyyANiOknwPZpnMaKwiOpc9l9/fvPJn7788tP7vvTyC/u8+tpr+/z13Xd2vvnG67e75uordjzrgnO3O+3sX//412eP2nH77Xc8bcCAQd8VigX4mQAauwPl6zCeKsHkHI9kHuTQxEMul4t79Ojxf5zPkzh/xxJHcD5/zgeaPU477bSdOMc/YbgN535bzvv2hULhk/vvv3/3J598cr877rjjiFtuueUk4vSrr776HOJCPhD95oILLriM19PFV1555ZnffffdwDkqlVZIGWhigLdMUywNUgZaYeCrr76q5vbgyqwiGwgZM8ZneQRB4N7l9OnT56Ptt99+4p577vn9brvt9vXuu+/+2YEHHvgRn8Lf50rtHRq/52nwHj3qqKNuWmGFFf6WofOSQBo9Bc6RucgCnEz7hNxuK+Tz6N2nT37ddTa4d6+9dnvzwAP3/eeOO27z+ZZbrjeeY4ladlFbO6nGojBDX0Kv4sHkYSorydEwHSvfYpaX4FsBgTUi8BqQtTwyfh7V2RBVmRA9ciU6uhJymQiBH0JqsTmcfEVagCLLOVGIsFTyaNiz5Yzp55EjR9ZttNFGY3bbbrsv999zz3/94qc/fWvLLTe/laugP2eyWbWbXnkBYonz0rwqzned4Orr/SOOOOJmPoj8nivxu7gCf+xnP/vZS/vvv/+b++2337uc8//baaedPtxhhx3GLbPMMv+RI1TbMNTYPaeN0uQeemBRhsoYDpk0aVINw/RIGZgrBspX01xVTSstygx8++23w6dNm7afOJBBkvFRPIHykriMkcr5xD6T4U3qVIaffPJJMHbs2EDfwpMcGUu1r6wzu3jMAgF811QGM3Qok4i5Ssplc8hmA+SyQdDYOHmuDGQu16dQCktOf+e1nUzFdMt4iMFQyZhrPULFCTQG6a9QeQoroTIZ8MR4I6YsSBhDxQXK9xhmvAwdnhdPmZLxJWtOmDJlSjaOwwmlQhFUks4VDpjPTxCUfyVE+kpEojuvBekjKLtVNDQ0ZHRNqJLkKRSS8Seh+iBPVWPGjFnhr3/9a0Z1UnQAA12sS941XUzjVN0OYWDixInrcCW2hjqXsak0PMqrhMq4lQiuqObq+lpuueViGi8nQkZObV2ijU6SJ+jbhr7PZdBcyOXCLSo2lugG5VzYgA6FZzoGDakSyo1Q9hQRzNiEDlXGXnFxkUC8gZ8kZBRRIl6JCphWeHRkUaRMrtv6K5wz6CxCrmgbOE4wnHODOdQQb5KlapSNRHeuxuIPPvhAg1VRq5AMVZAcxcWH0przRF6ZL0eGTZ06dWfKH6o6KVIG5sSA7sY51UnLUwbALZ4V6uvrA1Ehw5MYIqUFpWWIFJdxEph2Vkl5c0DMVZgziHR8rqray6G5RGsnbes5sJJ6S8CkDpp/BhFieoMetdXo2TPn3AIzWz1KJcSe+U6nmSrGvG0SmNFxldGynngyM0D6Qd2WIeembK/lOsY5LtYHIfkofyw2D+PL8Tmds9lsviobNGgFqj8XMMpxoEM0QgOqBObyo/nQeFTdzOQgbznHIwAAEABJREFU41VWWUXJOSKZR10jSWXf95u3ERVPZKsOV5Nb86Fp1aRuGqYMtMYA78bWitOyrsFA+2pJA+OPGzduIJ+QPTMa2IruZNySJOu5qEKBiRkrM2N2B1cNbjVGI+yqyJjpqd0lFuBE34UwjBEEHnr06BFnsxnus82dQM+X+jL5rO8cEcPmQ2VC2TEhcVKm7cUQMdNxHEF0maleuWHMrccE5ZyZzxThMo0OCFGMOI6mC3Alsz99+eWXhSCbrZPj8Oj7Zl9z7kp8OhutwDQfasF5cu87+bARcyWmrDkieUBJKkpmEq8MzcrD5FZlb15rK1WWpfGUgdkxkDqx2TGT5lcykKET68HVmMU0wpWOy6xseCorq46QGL7KstnFWZ/VI63IXJXKPlxGa6eZVWiu7dOQq7hUiujIgjgIagvNha1EuJ0Y03irKWtFBJ1Z4l2YanlQf5eVhC7Bk9J8R8UYV4Ogc4tDgHJixqOIcVAu+FEewdgMB3Wgf4zpOLwmXWYonikxatSoqDaXrXd/gxbPVDzPGWYzdkuH5H6Oi47IuBKbsXA20quqqiLNp7hQFY1JccpQkg8Z4gF01rHmCFyFeXRkc7mB6kSkp0WYgdSJLcKTPw9D9+nAcnw6dk1kfGSUlJBBUqi0e/rn/p2ZcQViziCpbC5A5xJAMmTcVD8JFZ8tbLYlzQVRHLl4TXUNamt65nO53Fw5sVwOFujbkm4FJhkJnLjpJzp1p6vqzeCEVJ+Gmc5Klc3MjU9jNJseBz/uK/VcuUEymp1aub1WPl5mNtuabDurI8hWNyD24Js/q+J5yktWw5pzszLhXC1r1RxxJTZXbpKrNuMTirsmJEcKKK1rR9eM0uJFPJoZxo8fj8mTJ2eUnyJlYE4MpE5sTgyl5Rg7dqzRsBgNi2PDzNxTs0vwJAMkoySDp1DGSHk0wHNl5ChCXwKRoTMZNbUVlC8khq8yblY2qMpL7H4SV4mZzsrx4HsZNOQLGLzY0K/1x87KnRv4vueZGd1LzF29EpvQsfgM6GzMjYwnljNnloeZOcMtPszMrTg0LnFkZk1tKNMJY8ienCNzaUDOreB+8DdEvneoCk1tWg+ymZpiCKP7NJhZU2U1j1za5xYhPObzkD6q4PIUIThvPMPVTcrlcMzMPZgoTsz1OzGOv9nOMI7ko7nWNaO+zagMC9Q3rzXwgclnMj1SBubIQPPFNceaaYVFloFBgwZNo6GZOmnSJGfY+GTtnJgMTiUpMngC67p6dH6L0fH1+/jjj3Off/55lUIasSzh0spTnDLinj17OgMpoyYjr9CsbNhoMJ08rgBcv6wP9TO7dz5cHDXXo5uB52cQ8bVSGHmT1XZuEAToG5mfZTP2HRNlXSBHIwFNjsZFm/RUfN4QuerWtFosy46c84qb5OdqquFnc+x87v7+l3zyQaDaPD+AVqGCOhFXBnO8iE9GYJ4HcW1mzsHKqZgZtGXo+z6r0HlHEcxMIhw0L2rD+YqYEWsOE1TMb0A9MoTm2ud1UsMV8EzyJEvzKH0Es3I/DQ0NVM1LnRgJTo+WDMycTp3YzJykOS0Y4DuKPqNHjx5EmE/jZlY2NjJCqmpWTitOw+UMo8o++uijPfbdd99rjzvuuMuOPvroSxlesuOOO16y0047XcL4b4499thL9thjj7P333//UdyaWk9tZNQSqC85Lsk1MydXBlRpGT3FzQIa2QCeeTD+UxkREzKyIcNSociFCTxMmlS/1KdfTFrrqaf+2ffBt96qHhVzz40VZnXQYTd6Qa4Us11E2TFXXwLNPuR05GPU46zazm+etWgYMZ1vLCCKvSj8DhoTc2Y+Hnww9vV3VUTN7255aKmPv/hyuHlBYwzLx/CKdIslOrOILYWYYSxpPsdlNr1XM3OOhuXuMCuXeXR2yhDfTXHjfG2y1157ncd5PfuYY465gOGFJ5544vm77rrrubvuuus5u+222zkKf/GLX5z62muv7ZTnS0bJEJpkKNrcn/KE+vp6bSca+e/rKqSnlIE5MODNoTwt7sYM0OFU0wCdQGP0NzqTfxL/2mefff6lcO+9936fDuh9xt8/6KCD3vnTn/60OR2H6Wmd7SAHo1D0mJWNndIJlP/1118PeOedd/b885//fOjbb7/9K4aHE0cwfsSbb7552FtvvfWr559//vgXXnjhJBq5FSjTyWcIGUw5Na36JEtg/wr0LUNUVVVhmWWWiddcc81o3XV/ULfpppv+fbvttrthzz13O/LAA/f90WGHHTbymGOOWeW8885Z9fBjjt5gh532OOzzL78NHnjo8TsvuuySdy8/7fq/v/zjg//xw21/+fdNtv3Z336868F/FbbZ9ZC/7rLvKe+efcllr339zZiVYQEgXyewd42PwcyHyuMyDzMXzi4nuf2ScOZ6PXr3wdjxE0ee89szX9/1gBPe2Xrng/5CHf+21U6H/X3znxz69423OugfV974y78dfdJVfznhtKv+eudtd7/82ef/W/aQQw5fZ9Soc1Y/77yzVzv55BNXPewXv1r5gJ8duAbner2f/OQnu2y22WYXrbvuuh8MGzaslOMLQHGuFViigbjmCsolNWY5GCU0/8w3ztdyf/zjH4/j/B7HOT2Soeb1aM7pccQJnN/jGR737LPPnjFu3LhVNV/JA4lkS5bZdKep+RakBx2Zsd0OP//5z9+nvv9siT333FPX6nu8Nv9yxRVX/IL6pas2EbqIYvZ3zyJKyCI27Mxzzz23wiOPPLLmQw89tBqx6oMPPriqwgceeGAV4dFH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pBM0HC/qnK/+6q9+D759yqtf/eon/cf/+B/d10/E5096xSte8TT8/wx87ffnG7lH3/iyl73s2dynb/rJn/zJb/nRH/3Rb/+BH/iB7+FePo/7+oLv+I7v+DHu8wu53z/xTd/0TS/5+q//+p/lGfgl7tMrnvKUp/zGk570pN/mWfmdr/zKr/wvT3jCE177+Mc//r9/0Rd90es+//M///U333zzG6+66qr38Xxlh/mz5nD7OmwQD2xQM7oktkFvzEYxy8xkZivm8In5VpLM85773Od+6/d///f/+7/6q7/67je/+c0/+Jd/+ZcveMMb3vDC17/+9S/60z/905f8yZ/8yc/98R//8S/90R/90Sv+23/7b7/++7//+7/52te+9lW/93u/958Jlq9+1ate9QckpP9J8PyTl7/85X/6C7/wC3/xcz/3c28mSP4NQfJN0DeCN734xS/+6xe84AV/9/znP/9tP/IjP/IPTr/3e7/3H0h87/G/OLFi2EkKsarm7r9//3YXCezJkczIX8mrKzAzWWSLLFbq856sYDuPTCKNWOyND0D3Kw3vVVzeq3r5Hui9qpf2qlrap/HSASXei/UKyb/+LnkcjhqTCCMrJ99NTKzuauoMLysqjUdH6H+/4vA+xeV7lZb3SZQ12i+N75eqQw3GjI9sisusBCsZCRJLGcikKikfZjKbQqCSG9Z3echDHnLwh3/4h//2Oc95zt84deDnv/7xH//xN/7UT/3UX3Af/P78Mffoj73Mffr/fvmXf/l//tqv/dof/tZv/dbv/c7v/M5vveY1r3nlH/zBH/wa+NU//MM/fMX/+l//6xe4/y973ete9+I///M//wmejR9505ve9EN//dd//QN/+7d/+xwS2ffwHH0nSfKbuZffRML8BpLlc83sE6yys+HrSWLIWBbuLlvWA10S27K3fn0TJ0isCPrWz86dOw887GEPO8wKq3YQdCaRdEVswxV4dzc4cuTIrBvmSWxlTmbiFZXMG4CXA7MxklBQLaWxZENJgC0+YyvRbJG6Ywnq8LYxCaZGT0RfhM/pylqgD87kjHm1F1y/62XbUA70+9ZkA/SylShv512cQEESNN6vBXS5vcEz40TjZiNmlkiGkURWsUIb8hwtsVpb/NIv/dJDPF+HuF95Sv5hIxe6S+eBk3igS2Incc7mbzrlDIyg7jHxpIJt0PctRf9TTwSZ3kk7bLDGpdGoj90zbhbzddLAVqfu+SYzKdhk2082gjWWJ7JAIjFWZ0byMd5/GXVRl2hnizDQx1dbyocnsmPAisybfERPkg7xbkwkJ6FTaTLWRJ/QmXl5jFqB5OXAPFdzSYJ7E3jv6i6SmeVfaD/FRI0+Wf4Ucl3zJeyBcAnPrZvaOfKAJzGCRQ4srMbCYDDYVIGD5FseOnSo5/PwT/dOzZgCK5sEObGbEk1R5smGUv5hcXnYnBLbjyIJmScwEpG3OxDlpF/OOJHyWmdEb8wNrvJY0JjbhG4GotzIUmjObDi91lqRRfYcG6lNd+X+MCnJ7xEfljad/Z3BF94Dqz9zF37sbsQN4AGCRQ4aJzKFd2C5CbkcWPik7H8p46R9cocNdKmrqmA7sfQ5kNCyZWZMITbR3hNSzgneQoHTSxOsJo/8S8ZZeNKUScj5xjyZTDC91ee6HJpq8/aQ+0puhlynTn742I6kkMW9LKZw8l4Xp/VsRm3vDx+WTkfNJeiJ05n+1pZtf5a2the62Z/QA560vNETgK/GPKk5nLdZwBwCK7HC7fV5kI1lRtxjJZZ5FCMFTzY5OZAoqE5Okgbt3pbFSThebhqDaJLBy8jMkK9rX2ibJDNvt1yW3BTlMWkXqxCwclrDW6nnAjzLhUvuYtZMzMzwi51yftzPUwudUksnsJk9wE/DZja/s/18e8CsiRGewBx8Qg5VVTXM8z34OdI/XFwseCeWn3WzKdO97NUMU5okEnKSUk4eNGRKV5iccmSzkr8W9LxIkstZzWWA6DPRk+VWLt62CvMEluUKcmpPSdAM/zNVK50o0Acb3J6EfER9Ho6yMhC5RE4+bMifMTMT24r4ZcXbJ5yhmX98OGFz17AFPMBPiKQtMNFuimfmAT7pikCRAwrJSx5ozkzTxeu1NKp9O5FnPaooIGIb0ZdVRsLwjJCwLScVoyA1V02OOKEQl4Moy3phvfAx15ZNjJ9IYUe3TuRtQpE5uv3Ymk3ZPGXvsWIbvM5zZpho/sw5qFM9+bkemZNr6Fo3uwcmPyWbfRqd/WfqAYJAG5rXVEF7TmAeVFygmPqzRF7fDLhi5xW8x1su6ljJwlgseFRXHuwL1jLGdmCQscQJMdBUyPCIqZbyNwShJD1NpQnlw/k16YeEaKugE62uG4L2gkSZ6igzgxHV/N5YUs37OMu/NFZJBny8DC9H5WPlSx2psSlJgYRmnkQpy8GcWLaoCAOhXMGkfj94S1axmS6+Td0+Z2aWn7vNZH9n68XxQLg4w3ajdh7QBXPB8jD6FmixNFxmTE8QJCDCfNnzLUHJFHOS0FFHlEhOyolE+SA/QCc/Mt7mgOMn6pwA+nFd1znVnwxEl2P6NgPCnz59pFYuqj83J9U1eSwphFJVNdLS8pE1e05r6cqdBy4VD0x+Ii+V6XTzONceaD8Zn2u9F1LfkQMH02AwSFVVyf8eX3/AqgUDqmWSGsuuZLWSr4agnkzSdHI5n+lgekUl/1FsgXF+er5ymhGVk2q2jTKJV9g+Wl4kiVUyM/UGfZX9nvqzsy6g7ug8sBU84D81W2Ge3RzPgQfMjE/7639kfvM3f/Nbrrrq6ndec82177z++hvfeeOND3jnDTc84J3XX/fAd7S45rob33HNddcfj2uu/8drwLXX3fD2a6+78f82uP4frr1uGg9423U3PvitN9z4WX9/4w0PfuuNNzzobQ+44aYG19/4D16+7tqb3vayn/vZX1xeXCwGvb78d49GR47Ij3J2VrFNCiQET16rdc8DjulM4nOfwBOQKzknmOhcSWSnUIqt0sQu7olmZxRTYkFWZ9zy0Y8+7oEPfsTfXv+Am/8Wv//9Dddd99brrr0BPOCtN1x701tvuO6mt11/3QP/4frrH/gP11334P87wduhEzzoH6+77mR4MHK0X3/TO67j/l133Q3Q6zKuvfbaf2pw9Tuvu+7qd9xww7Vve8UrXvHVp5jRdPNkYtOsU5bX3+eUqjqBzeYB/+nZbDZ39l4ED5id/pLk4x//+KPvuWfvI++66+5H7r5zzyPvuH33I++8Y/cjd+/e/eWOO3ff+eV37dn95XfdtQbu2f3ou8CePXc8Zs+e2x/b4M7H7dkzhd13PH737bc/4Y7b7/h/br/jzifccccdj78z4zOPv/PF9gO9AAAQAElEQVTO2x93+x2fefzuPXc8/v4D9z3MisJ8JVYUvlLZJkGrSTLz5OWYdmuOijbNWeNH5ZwksiAfxrg28DGDXwD0mDGaJEtTPkmyRVDJtmgcDrUMZua2qRzMXP6vn/zkv7nzM3f+mz277/5/9uy56wl37dmTsXvP7ifg+8fv2b37cbvvBLtvf+zuBo+BTnDHo3fvnmDPnY/efRzueEzmcf92g7t27/nyFnfvuetRjrvuuof7vvfL77hjz+MPHz78WVrHwao/u30dop1I54EVD/BTslLuClvPAylG/7MT6594jDGxJbeuYFPX9UJRFHn1ZqwcPEgHCwokxAx4SjWLCtSxktBaOJlprKIshBz+m6uPkKg7mrJ3r4ZDpdFIMcaMuqLdSqnXbCtKARuACx8HO45zLhkn1J6mR3GpiX0ktdzkLLd7mS1RF50ZNMmMOS4fPKgwmFHw5IaPI3ARvwf+TcgWyl8kwf8no/nLLRX+WQs1vqaJ/q3OFcq9JCnl/2al3+9nk92GDp0HzrUHJj8Z51rtudTX6dooHjAzhbC+R+Ytb3lLeejQoatiPVaKFWGU904Eu0hQbJGoozIHQo/JayHAPDECuhu9ST6Gw+sJzU04LUvsJZFieA6oZoVq3o1ZNJknMk8EGUY0LkCJrSS4zKOvOEgcXI8/jZXQ8dzT5LgOh8d5x3R3H9+BWdiTgDIMIcCpmRlVzId9UtV1UhVrqVcqlIXieOzTBoG5ohv5ZnZownb3q0FPhhAi/U8MKWKL0H80GNFf2eVfyRgOh0HrP9L6RcW4eW9V3bF1PXA6D9fW9VI382kPJD+mGWuVd+7cuW3fvn1XeZvJFCzIA2IT9DzwReoSGUN8aD8hTYiyuNDaNMqIYeaBmLRlKDNXycWTo6A5wJNEWYLJDAbtFgLloDT21UUBB6TpxBWwx3lQORA56owSY+psj6N0oDMnhJZOKc9J1G1vgU3OS9RrkpY7sD8jX/XW1Oe3b1e1uCgYitSdF3Fg9A8QJPvoyHXGSkwV4Dq5mmMpYu46rUWd11rpfY8CihLwdlbuONNLJ0fiOLlE19p54HgP8NNwPLPjbB0PmJEFTjFdZAj6RjCLfNqvU6/X87B30l6Li/f0R6PlORlBkiEiAZqQKaPeImUtQSZWDuD0KYmI7chEAos+BiCky/VmrFjIQKzGPKHl0Uhiqcaaoi+6SqzKZIXkiSwVpK1C4ipPEoLvZXQZlrq7zEwUGygyXsrQ5PBY7GhXrU49kUyasx/NLNOWJ/SsYpWLYglZpkbeDJInL7cX8+UryeDJV/nwMT2RLXoCK+GTwOgkYa4mh3dzZN6E7wTNmXU6dKLyKIKn1SIrpJXnwIegtK4zub98LuuSxiPrlOvELlEP+DN7iU6tm9a58IAHFNcTWQ6ZmTyBjXi/5LyT4fBhDQjcMzmZENVa6gHU0dZdR/sQni71vpgkD5ZOHTnfuCKHh06HB341R/Kkx+CJpGGUzVxAOdbnwMk8I68JkyewjMZ4b0uE50zpR/G48GlmMjP54XLMfyVRuR8dZpZlzBrqQ7j8cTDnuKecNnCdTcmvCKBDNatJErKxjXh0OzKIMJjk1P0BvIv7yGmLgkRt4HSpZcWrbsBTag8zy0UnPC9Frqzj4nOI3AOnnpBP0WV6yFOIds2XqgfCpTqxbl7nxgMeUFpNJDAvEl/SKYPH8vLy4K677plRIJj5U+agmOOeU687SCbRt7fOAIm+rSFu0bHIicZXWIEYSjQ1M5k5ErTGtAhqGYLZTEvylZabxRpPKiixajMQHBYEyTCaHO6Q3EaDmaktF6z8vGxmag8cJ/fndHLLzejyZJYQdEAk7+aNE5iZ/H+NLiY2KiRESHL0zTablF//BakwLtgjMzKMA5IakJ/lfnLq8HLNcvRMkPAbarOtSYzJUJrQxIQS4ycEqirSqFMeJDux9WjuOzPLvjpVJ/PJn0po07R3hp6JB9b1cJ2J4q7PpvEAYebkthIoiIeWQQBe13YiL/Nnh6Oqr7z1xWPmcawFKyMPbg4ZY9N8IurGJWTWorkPbWhQLuuYw3pEbpRH+Hy6j7wbSwRs8W7INCIEjwiUY2QqWRoSfqG0u4yv2CQ6eh/6JhB5CeRJiKIoZrhv2uTk25UOfKQWjJxPl3G4vCc3h5fzvPIli61eMo9LdlKNnbUSgyaSvduveqQEgnkSxu7kX6AZSazMUl4ptn2Z/4pWL7domEjhB50h0OU+ZitYeE++HetU+N0KlJYaDGaxPTObAU9y3bZtm/Abro7MlRSZ536SDqtNPo3VWlfaUh7gKdxS8+0me7QHTvnD334qTgQUD9AeeCcrsqM1HVM7PKwXjhxZCjLezayAd1A2gebo0VcK3k4xrxzWoqacoMJa1HkESw+aDv/7gTZAfoIcXCcBNRTyxFFYlIUxqFTYWL0SGkYqQr2CoJECbfIkFlAH8hdTLChgr+sxeA5x5LqZjqXicL85KOZ2l3F43RMi3WSuq8gXyQrOIHN/MFa2wQxba5UhqiySQhFlRSULlQLzyXMi+Rr3yOVD7hsk729QTzSt321G8rL8PuAb/CLGPCN43ySO4mjwIUVqeMNhpTrlAZE5+Wkc+IRpJLEi02Dyl1VO3qtr3eoe4Anf6i44q/lfCp1zGDrRRPhk7J+Oc3PBFhmflge33377rne96103vv3tb3/gW9/61ge9/W//9rPe8pa33Ez5If/4j/948z//8wce/NEPfPBLjxxe7isHUIKlPLH0lQNoIpDKQSKre0pxANamSvRJ9F2T0hZJgr4CcNSUc53xInCeB3E1j7knE1+lxMmqpY7LrBIWM6p4BEq9WlQ1XlRdLZMPWNl4IiM5NH2b1UFkaZim4D5q24nDcj85cjKR5Ly27HIu70i1mLeDzcsaGz34u97Mj8Ig5YP3XXUcq6qXVbP6UhzSz7GsVA8VM1iJQWHIIrc0OeiNPj4poAt/ZN+4j/Cb+9Prnvzbe7QWzR8E6LMWdXud7352Oo1EEvOx4e2+464v/uu/fuvn/tM//dND/u7v/u9n/93f/d1nv/Wv/uoh/sz8wz/8w4Pf+c53Psifp49//ONX8gFpzn1V17VYzTOB7uw8cHIP8JNzcoGu9ZL3ANHuxHP0T8QehF1iNBrpM5/5zENf/vKXv+wFL3jBq5/3vOf93vN/+Ide8/wf/7HXvuhFP/n7z3/+83//+7//B3//B77ve1/7P/7H//7JpaUhWYpglj/1Ezg9kXkC8w/mGSSy8jI+tF9+YpRXSCdCb5fU2yH156XBNlkL6iXlEqrAuEVPRgIue4FP+BP0kno09frQsmZFVqvsAer9QaGZmZ5m52Y16Pc0GDgGUNCHxxbZANqDktQ1Pz8v91Nkn9H/qxqHr1o9EIcQ5BCHt7e8ubk57di5U4O57RrMLkAd2zVLeXZuG3QbvBnNLMxhRz/b0+sHxsHGnia2B/WZU6809Xqmfr+ElirheRJVKKX+3ASzUm8bWJjCDqncfnL0kHEcK1egx1GitxygY4ICCkLZZ/gZlcWM/v7v/+9Tfvj/ff5/+87v+N7f/+Hn/dAf/MiPvPAPfvQnfuoPnvfcH3rtD/zAD7z2u7/7u1/z3Oc+93d/7dd+7Sfuu+++B7mfWp+pOzoPnMID4RTtXfMW94AHY189eFDJgVEavOMd7/jKD3zgA0+67bZbvuoTn/zUV3z4Yx9+/Ec+8uHH3nLLLY/51Kc+9diP3XbrE+65597rypk5W9h5jbbtvFbzO68H12n+sms1S3kWXqYL12v2JJij7WSY33Gd5rcDl9t+rRa2X58xR3lu+9Xaftn12r7ral12xdW64oordNWVu3TtVTt03dU7df3V23XDtTt1w3UNbrx+hx54w+W66cYr9KCbbtCDP+sB+rzP+7yMz33Y58nR1j+Hupcf8tCH6oE33aQrr7xyJZm5r1q476ZhZpqdnc3yD3zgA/VQ+j/kIQ/R0XhornvbZz3oJj3owQ/QAx5wlR5w/S7svUw3XLNdN1yzoBuv3a7rrwLXXMZ8oNfu0LWUr7zyCu26/Got4OsF/ND45AYt7LhWC9uvych+23G9ZrddezwWrlnhzcxfI8cAOo0+9f62q9Wbv0rl3JUZ/dkryZlXIn9FpoO5yzWz7TIdWRrNfurTn/mSz3zmM4/51Kc//aiPfvQjj7rl1lsf/clPfvpx8J7wyU9+8is+/OEPf/X73//+r8RvfU0OypNSRzoPnNgD4cRNXcsW8EAys7SeefqnY19FOGVFZocOHQJHdPDgYS0eGenQoSNaWlzW4cOHM8ZVrYotqyps18gu11CXacl2gh0a27zG2p5RhQWN+ETv9GjMqwrI2ZzGUxiGObUYa5vGcSfYpXHdYIl6gx1ajtsZd17L9QxT7Gu2N6v5maAdswZqLcyMNN+roFHbKM/1l+UY9Ibyd2UzA1YTvVIFq4qidAp6QQGU1B1WFgTtORX9nkZ1xZspthyDyRMXg+bTfeYBGV/nuvtxdtu8SvQPBgPNzIKZvmZmSvVn+2AA5jRgpTeAP+gluU0z5aLmBovaNjii7f2hFnrLWhiMtH0w1s65SnOzIxKpFPrS4lAaRXyAX5biLi2l7WBBy2lbxqjejr3bVdll+HmnanNshzoW4G3PiOUuOVJ5hRx173I54sBXwZdLvatl/WvAVUqDBnX/akX4sX+5YtimMc/B0tJQi0tHdGTxENuESzp05LAWl5d4fg7Kf68NGM9O6R+a3EnuI/ebl0+GiYydTKZru7Q9EC7t6XWzO+8e8PABLK0+SmbOEAExKPI+q9aAYDmrKMB7l8oGlPuglxNdTZCreK9yFHhXU62BOvXUIrfnvv2sZ8y2ZXVMPTF+UiGzQrwskqnmDdkQzpJ6aQnq5fGEDmUGNJbLCQs9GdVK9FqF81roLI9WT/KxWqSUk6C3uQ3G6OY2YVuh1uaGlgn7bUkWFhWgCkMsqtBUKlqfngP8NdNAlPFRneHlCdjirXPbpJ7Lvdy3mvLnWuW40ncWC/skrBnobO4bee/pepPxbFjzTEgR+6ZP2qarp19G8el36nqctgc2bIezfoI27Mw6w9blAT7JpnUJnkhoEkLMmoJZQwU1m5RP1DfzoyzFXMoXXxg6cmU9lxohYBMQJFNbtor0U9EeFeGlQDoKY3hjycasEmhP8NJq0vDEcTrQWR6nGuvE6ic/uszL5yJVzIe5+JyZp6DOk+FbZPLc4aUWyGTeZO4Rr6wgGUnUcbxfDPmM2LS5fe0cvJyBjPNyubt0HjjPHpj8JJznUTr1l64HjkmBK8GLQHb+J03YJU8mAvUqjjYo0q42KWYaFXMAb5Lb+bfxfI4Q5Ukpr248OZGQczkPSfLK9ESXSXv2SStzuuEgkOyO9neryenKs+CV8wTG8Dt8nrR3ajeDB073qd0Mc+psnHjgQhKCycpwbbmlKw1rFTyITmMtmSmeR6wWLZuFA8GcWt7SQF8qHQAAEABJREFUpJUziUebutvgYdbMWByaxPsqJPOZGDe3k3BPRM0s9zNbm2ZF5/QS0TYNqqc8Xb4RSjjD5yIF7GYLFR8of909IEDSMTW+orZymnuorTVyon8G+nIHlwGc+TOBodfLba9ME3ocuXJhLsbBSAa6c4t6wJ/YLTr1btrnwwNNAF2/Zo9BZ45CHmPlAZegKpmUywTvo8qTugsT0BMyqVmi6VRjo/C8nmc/fmCr1H+MA6siw1bKzFG8YxTzFG/7BLU8d9ooe70B4ic7vc/J2o9tMxMO1QU8GFCOCzhkN9RG84A/1RvNps6eC+iBEKaWJudgXDOTma1bkyc9/wXkVTTvWiKf6B0psnJwUHdZ8S6mRa578vKg7cHaA/cElilJLhayWMrUw6YSZaVS9Me+KSsHdZpOcQYWGecDFmvsm0ai3vggz++kdjGPPH+fU8HcHMxzMneltsxcVcrwk2V/uJwhD4RzVzAZzJOXY1J1Ykn018oRqDtWGCuFC17wSVzwQbsBN44H+CnYOMZ0lmxCD0xCiNmk0E6ButkxvLZthXqwruXB+ljAJMh6+4khElpgjMAwrEMkomog2jrMTMGRAzRNEomM4C0/SnR7+VJ4/H0OPnsoCc39aFCfJa5wlzBvTRJQpEz2ocHU0khj+36Q8kryQp8cOulhZjKz42TMbE3+cYIdo/PAWXrg1E/pWQ7Qdd/QHjCCnp2VhcRC748eJ6toV06rnDVLQaY26ZhhygqClL+aLSEi/50scaRUq18GgnItRYJvGkoOjbT655iGShE+SHGM/loR2ZgqsfJUUbBCc/vYUkxOgfNQL6+31HnkxZwInHdeYFGahpqjHdft8bnHGJlDlJlluJS3MQUvZruL0uTpLDJPXKQURxJ+MffPxBeKy3J/BVWy3IZPkBJ+xasyI73VCVoA85YMz23J7cw1v3gbsvguAeesB2Z2lN719DmZjPvlZO1d26XvgSDp0p9lN8PN6wGCnhvvgZIFhArqHrjMTH3/M0w2UqEl+e9Ilbasshhm9AK0rDQzk9Tv1fI/8Gtp1AR2Ehvd5f+1iSc1h+tvYdYEWv/zUWZN2ayhbss0zBq+2fmh7VieyDypet3tdGpmTkCUf6U+kZgchVX4oNKgF9Uraz4AVOr1xtTHlEdy34SAr/CdhbEC/cz3bUlSvnoly8gP97NTueMnK9pc7y6dBzaQB8IGsqUz5eJ4oI2EF2d0H3Wy/eXFNcEn/enA7auxwHbY7Gyh+XnT9m2mnduknQuOqJ3bknZup7zdtAPe9nlpdiayChuxChkRkyt50Df//Sl0i8P1O8wMObRXtQ7uv1/79u3LuA/q2H/ffZrGffv26qxw7z7dN42Jvn337VXG3rt1YP8++V+ycPtaiMPMcgLyuTh8xWXmyXuEX5IW8MGOBfcF/qG8sD1q+w7L/O34aNu2oG3zffUHHgai3K+JZGYytUdegbWVnMjiSk2MPlW5WEW7WAN3424MD/jTuzEs6ay4WB64OEFgZbbrfAR5/6VJEPWtQWO/bW62p8t3zuryy5wOdPnOnnbtKHX5ZY5+Ll+2vUfQLjU7a6zIkvy/LUka54DtE3ddmhy+IjNzrjQajXTvvffq05/+9FH41Kc+pQuJ3bt3a+/evfJVYSLhmjVbeG6y1x0FSSc4g8Re2FiDQdK2baV2bC+1c0dPl20vtBMfuW927SzVwn2z67Jtmp8bsFKNuLcGFVpqGasvs8YXYoWW1XeXzgMb0APNs78BDetMuiAemESpCzLWKQbxR9HhJjmmxNtgCsvMZFCXnOn1ND8oNDcwzQ7iCmb6tVoMBrUGfQFTSV8PyMRnGau/lF8oBZk1icHMclkcnhyOHDlCsmu+WOJbaw7nO+RJFXj5bKAU5UjQBs14iYTlqMbjnFB9K3E6yXqbQ8wDc5uTZMMUVBQpJ+yZmaB+v8qY6VX4p9ZsP2UMnM6IBFYgayqC8Elcmb+OOfKKzDB1AnddPEbmIlax6iKO3g19UT3Ao3tRx+8Gv/geuIgBYB1DE8wVXI7tLtUUEx4DBOyyMBnvcwrnp0phBSNZHEppKKvHCrQXJAljJWfe1QpkAzKWtw7NaInoZ6ycGCTeHZUyM/IL/Kk2b88QycYx6ZN5Z1TGTGyiqxqgtynkBgtBnjwD1MfAtHx63cwoB+RKKLbWbit+YJ4+Z3N/xErGyjP4lzx4J+i0SLVKZApg+MblkvuH1S0uVVbrCZq+Yo4o59xAKQtr2jMlT69t7ZS0E7gEPcBPwCU4q25Km8wDPIYeixwrlsOblM08WFNJiYsIsk3dYi0WHQp1IinFDOcZQTp4UE7IEow9cQVWLCH/nlRQiD2Z+g1IaARC+WFGImAMr7dJwsxktoogkwMOJa5TbWZnUpfoJs/TDrOJDkGB2+J/0d1pCzObJN8CiRIwl1iQbxoYc3X4tzcDkycNIhNFjhJVQBkdBVzVlXxL1d+HaerwsaaqxxXxuI66XcdJXDCGXbCRuoE2pAfChrSqM+qCeYBgdXZBIGGqA9KcsSFEuEAwbSqTx4zVU1NnxeABtKkcFQw9yDbsVk+UGSZ6hPcEQ6OZJ5tayvqSjOiMhBzBDFrIj4KSmamlRHnlw/u1YPViJDrn+5admRHUY8axyUN5fFZKrF4SiAD/wU5nDB/agWo19GhdZtjDVEsjWZFwQ2ioj+v2ud1eVipJUqVK6ysgm+ecvBX/KRfkA7jdzg3Owgf+tXz3X+J+8ZlANck/60PAWP25bIvVe9NyTkHRmSVWnoNc4+KDQ/IZ87W7dB44Uw9MosuZdj///boRLowHfOXhIznt9/tezPCvdnvBA7xT//+vXMbLLYKMMEmkVROQEoFQBFsRWB3ESuWvcCcPXsgQmL1vpN7EOXjOUOAakFXWaCQJMpB8Oy3WpqKcVVU1skZErdlKTGEk/yO4/jtMrj2hIwU2yizQ2zV42KbFKoWiUhHGMlvKCDZSr5RiXRP8GZcs4mMVRSE/2nkaFctzi5QcUqJ0Ts5G+URfQKVD2AcoJpJsn3d/ifmXGkiVkaxMhq19bJeN6cu8LOCqvuLYlJAR7cZ9cC/4qtRXYwU+M6TEUeOdlGrEhirYQ0yRJGizzDJw6wx+Lc89xg0yCg66cbpRJve3kIax5pnol1JiHnZMe+O/luk+bv3tPK+bNX287LxpmFnWaWaZ7d/azIXusmU9wBO5ZefeTRwPkLASRB68nfqne/9mnpfNjKRReTEHDi8Mh8Msa2YEv0JNKFE+siI118zIl2kJZ0wHsSAPhsQ7b8gwujc9XM6R2fmS8mjeh2rOjN6eqDh1SP6FA5QqgxYzAq4Ha97v1Lwfq1PFaqNmDoTxOJbP14OtoyLoux+8XMv1omBy+g+KY1JtSGNoUz7b67G6pupuj9vFqzlWfCafqdfH2G8hyfyv8rt8MJknMyvkCaAIE6PcV7nXpE6ib0oJ4tog8BJQBvXcB+onNyjfF5KZVxuwYnRmUznx9ag+02IxV3wefg9yhUsIrdHiHkWZGdwTn2VZ+iROLNC1XPIeWH1iLvmpdhNcwwOJABKdb2Y58InDzHLwMDOR5DLfP/G2AcbMMo++uviHHW+CB1cHLW5zUfQkXxkGVpjAwoxCMcMcZyQrKJOMywIZkyEXip5CCBni8CjpTnJQXT29YbV2dqUc7MNxOjAPm+CbCYNk2BmAioZXs9qpyG6egB3kG9JVyqjhH6dwhUF/2UrtYhbMTO1qzJ8zT9riCNyDtkw1n15v4Qw+cNXQc3knUNedm8kD/iRvJns7W8+xBwgIOTZDZdYENS/7MP4pmSCx8omYT73EUVZCBE4PMG3gcdmLC3+MHW5Fno4XMjzROjye14S6mArWWD020waqVKpi6RYtqKJxDCI+8FVYrrMll5VckEtr/+pgmCsWhxrHWhWViOV1lKqIvTK53bEoFANJGrvFPGKAjwqmwn2jcNTpYzhgpuZeq115wbpYpz9vNVu6Pr6Z5Q9O/mz582dmMluFP3ctzEwz/idZhGO8c4ct6YGwJWfdTbr1QCIxRZADRRtIvNHMnKzAA43/wq0HEGd6eVreeRcH/gg7pkcn0quBx2orgoxAn9RXMlZj+d3PnKKxEisHSrRFVmCyUsFXbdCalZGFAqUBrHU637FW22nwSE5yHNNlmhWwzUByu6xAHLuw01hNKgwwm3lRT0WpRLtBrcA2ELmN7gmJ+jFjbJRqYMVlZtmc9jnzBOb8zOTifIiOpYcPH26m542bHJ35Z+aBjftkn9l8ul6n54H63nvvPUTAWKZbBWoza+H1qtfrZUpAqWgb+3YPvPxpGR5dLuJJoiEDNQZ4uSmtXHMCM8uBPRLEfdU1HJqWhtLSGDoqtDwyDZnhEnQZOqxNy8OoUZUUSBxqYuuKzgteKEhYFjRm02w0ThoOk5Yr03AUtDwOOrJcaxF7l2hzu4ejpCHlmslbTsInsNjSpCFO6MUhBfPj+VtJTqyscplkFc1sjFVjyk4rKHdIXnfKTmoaXnbZZYvIXNxJYEB3XjwPdEns4vl+I4w8etWrXvX6//2///dL/uzP/uxljr/4i7942ete97qX/smf/MlL/8//+T8vc+qA9zM//uM//luDwYA8VuW/IuHB52JPIpJkogKrKmVwxaRI4mrimq8Wq6rW8qjWwYPL2rv/kO7ed1h37z2ie+5d1N33Qvct6h6wd9+S9sK/6+4D2r//iCqSAYrQd7FOJudJdbHW/vuPYNsh3XPfEbndbu/d9xzWvvuHDfYPdd+BZd13cEmHl4YaY3sikQnfuPXuDYeXNxL8/viHId8N8A9Hy8vL4hlLz372s9//pje96Wd4Hn/m9a9//UuhL33jG9/4UsovecMb3vAy6EuhL/mu7/quP2M+I9CdW9QDXRI7mxu/yfv6J91nPOMZb/2Gb/iGX4X+4jOf+cxfeOpTn/oLz3rWs34R/BKB5Bfh/9LXfd3X/RJtL3/MYx7ze/7tRD4RywOPY2O7IKoc9FWUbLexpPLV1dJy1JHFqMUlsJx0aBEcYVW2ZFpcDDp0JOnwkVqjYZKsJ6kEQdSg0+e5Tgmuz+FjBC4GoOWAvGxaxtbDJLPDR6KWlqQj2HmI8qFD2J9R6+ChGn4tn2NVBTF77J7oQZvM9Tu80lIvXzwUk5VYVVW8w4uanZ3VwsJCuvnmm9/3xCc+8Zd5Hn/56U9/+suf9rSn/dJTnvKUX4L+B+gvQn+Rtl/51m/91n/iOWadevHm0I18cT3AT8nFNaAbffN4gEDjEVEEjRxwTroSM8uJzhOejj1SkxLMsrpjW0+z7o+w4+huRgh3jtuI3SpJZOM6qmbbsYqFqlRS7ivWs8xlTnWmM0oRaEYxefJgK89XMthptpat5yARuFrHxF63OcN95CupMWP057TItmGMvM/TnKpqhu3FWexfgM6BWdWaVxUHGlclicu/fdlnLuJeMQfek6k9JonM70tK6G75x9I8fkpushkAABAASURBVHOfjm0627q70sywzfD7av5JjOm4+uqraz4g7T7bcbr+W8MDx//0b415d7PcIh4IceoRJ4ElVlbNCoUgn3oE/0GGJ62YZpU8eTmQE4lOMjXH+Qnoje72ulZSwf5EIsKWKFaGqZ8TbEoz2DojYWtT9qQ7IIG5DPLYn8z7glZ9S3Miaysbh3oCMzPt3Lkzbdu2bXnjWNZZspE9sMYTvpHN7Wy7mB7gvcWFiOSnPcVpo/yBdoiEtaoosM4BBPWUkxKJiVWOJzQR7CPJLJEgHMpl/wZgUBbV5KDLpDRFkJmqnU3R1TuEpQ1abc71caDMKWGfsDnJV2UTJCj8CF8kuwzvjnzeQvSk5ci6veHiggUXCTitGGFmMrPMYwWmq666Ku3atevQikBX6DxwEg+Ek7R1TZ0H1vLAavRZq3WK55+sp6rnvEgekiMH6jW0mwfxFT6P+qTuffIqxbcKp0F79DpUMh13rME6TuacMxIaj16hpWwbxjQTkVej261jDhKX3wPHUS3Mz8xk1iSOo9raCm0ItLXzRs0aG1obzUxXXnnlfTt27PjoeRu0U3z6HtjAPfjJ3sDWdaZ1HjilB6YD/Gp59cEmWBO0Q7RjwjyyBPmcAJ36KsXpBJaXC5ocyE5Kq8RHaLHKPe1SoocDIiy0TNuLjwvcJiHk1OFlhzkPHGO7rEIB/Zy/Aim4KC3N6bZbU7xIV09cZqs2mDXlyy+//B8WFhZuvUhmdcNuMg/4k7zJTO7M3RQe8CRwgQwlP8n/BuOxw3nQ9jh/LH+1TqD3gJ9BWR78PdKDnCycR5kO03oajv/oNEGX5nNwur5GzapWxs92MKJTqxEA2V63FTg/Jyr4mcLLNIo1DvJJbrv7QiRJkdAbarT5mA6K5/E087FOPYAZFqcUSWJvvO666/acukcn0XlA/lR3brg0PbCVZhWPm6y1wbptsZRLTjLkde/nwX8CTxKeICZJQG2CyDR3n7r4lyfOVQI4iZ4USUaemBxReZWV7RxTnsZoUmcuuR3q83DbHV5We/h4IPuo5V0ASpI6dhT/9qjzzExeTindxzuxd33Zl30Zk/OWDp0HTu4BnuSTC3StnQeO9kBJ+PffnWqQ1NSdKpebLxl4ORJ+hXSGZ46sKHBtQfFcnx6YHVlvlPK4ULWH2+3je51E5gG+hbMcXs9Bn/ZMmYHR4FWI8mc/1+nIjHN6WRnGtWb7veA2O3xMh/MclLO93tai5UFdJMPbcoGL80HuR/Uszmyrv5tzHfjdoA7hN6dmfvWx3e+FovV5IvwDgNfhGwjU4cufn1gcnJubG6KmOzsPrMsDYV1SnVDnATwwEp/21UuyWeVfBLYedIagROLSDOVtkubBnGROCVS+srERuSTmlGaplMWCPkFt7NNZHsGDZ3Il/jg3yNUcpCtZqL1Ryb9u7+OrJzOCa24ngNJfblNuD7nNY6sHYiEmb58Ym/Vmba7TEXPt7C6uo8GK/raAnYnVmBI2JxLAxA4R8Bu7GDnb18PcgVwut8HG0TJjAt6eE2+YXBnLfIAo/z/FzKyRo0+a3gaeLtN20hO7TJKrLbA3iDHkY0gxj49tkeci8uz4s8I9UIHNPZ4dnqMUaee5Gldh8bLLLnPHnnS4rrHzQOuB0BY62nngVB4oo//fTTN16O2QeiSs/kJDS2i5nTJwWlD3P05rrNLayGYe1BiBYJeaDEHl7E8PmifSEn1MxySYKodwO148BXgN/EqlOXPfpqjc11sdzMXbHG3zOac+jmOimOTb2OB1xnd7st1epyW3F5Lz8LHaJOL1Y2SbHq6jKZ3NNQ/VKjiq0jBrmRRIUKU/Lzw3/sz48+LPT48POoGk1uN5Kef5XLRDvcHs4vz8fN307q6dB07tgamfklMLdxJb2wPRk1hvrhoMdqgYXKbe7E7NzF6mfsZO9WZ2qJzbqQKEmTmF/izpwz+T2/GO8wTgOL6l42wqDyQla6BMPX36PQ9KnsBYZRW9WRbvC+rN7dBg9nLoLpWzYGaXwuyVMmgB+iS4Xn9h1O/vPDcZdlP5sTP2TD0QdKY9u35b0AMDPtPPqijm1WM1Zqy4Qm+7Ap+kA5+sHSXlYjCv0j9Zhz7rgcnWIT09vHnAc6qcwNIW9OElNmX/fOJgWn43M6j7ajv6lqexfcyqvOR58OfDoMaqzJ+bglV7CXo8Sz14RZiTpUH0P0uPuu7sPLAuD3QrsXW5qRNyD4xEUvL3MprjU/YcrG0axRmNU4MaWtNea6CKAFbVnsBK5JrHLO82rSQvD3eRNgekOzepB/z+Ab+vGeLZmIBt4zHbmXXy52Ag/9uPVeypTgMwA+aU/2ZlPasU55XSLB96elW/GqBwk7qjM/uCe6CJLhd82G7ATesBAlLFS/nIO5gK1JOkFUlctfMdsSQg9eSfxpVXYL61NPWoWWT6EXTnpvaAJy2fQEu97LDmknw7kU8uSQUJK6iKTnuKJLGYnPaav1vpzw7bjjXPU1IZvXeHzgPr9cBUZFlvl05uS3sgByVTIjA5eBsvh4VSKRTwQ0O9zCdxIS8Oj2vGp3JLYsuogbrj0vAA93RlIl7O99xDS/MsiGdBVshhoUe1LwsDJT7wyAbUB9T71APJLn/qUXd0HlivB/xJW69sJ9d5QHy49nykFExGYMpfyTZjG4hHKSXFKOULZYtGhTMHNWg+kYMawc5BsTs3qwdScy9F3sn3Mtft6NnwHLAs52z5bR81vBRJXEY5sSrjoTi697mtddouSQ+sPlGX5PS6SZ1zD3i0ApG0FXnzZVbLUosoo42QBI8yMh66MkhkNMEXCGp/t8t5Oo+HJ1kzI69GhRAyNWvqeVjKItCauZWZwxym2hvWpr36/E9mvFkzb7Oj6cn6TLcZiWsFNPj9bMD9J0GZQwmfJlojrq65B1Wm8t/fQzilSv7rENwe56cjSHZn54H1eqBLYuv1VCeHB0aSVUS7SiKByaJEEBKJrAGBKpeTENLxh5G8lKF8+OPnyJXusgk9kG9/agz3clNa6zr9rNAhCzt1vj9PJDh/nliPrdW743UeOJEHNngEOZHZHf/iecCXLR54gCcykD9t+yfuKbBZhImJhNWiTV4GvwXF7tzkHmjvZUObq/gQk47H1PORnxlFKSetJHkCcySW7OrWYuqOdXugS2LrdlUnmD2QiE2+PZRywStaCUAehNQeHqCi/LWYw7nHUud12NweSOs2358HhP0ZaaEJL9Mk45liizEh1Z2dB9btgS6JrdtVneCqB/zz9mpNvBdZwRS7Lfpn62hJ/ovOq5S1Gmq8rZXbKLSz4/Q84FnH7+3RaO9v5L47JnUFpRZ2bPjxB6JI8/nvb56eDZ301vXAsU/R1vVEN/P1eYCsQz5im5CA4z08gTklMGWyQidBqxWDNsEOPoI5mUG7c3N7gMdBDp+F31+nJ4eHnAnyszMp+5qeeohhfWpOPkjXuoU84E/QFppuN9Wz80Cf7jwyBBuRrGxCvSwPQvASNPEJOyPXm6SVxGGU262kluatJNq6c5N6gDvLpxqu4tbL6dGYWnnl58GQaZA75E7GhyKeK9pFKUbfV9QWO7rpnqkH/Mk5075dvy3qAf96fJ56TmJeMr+ACW0/msM5n6flBBh5lxJXhokExRozoidJuCFFwiIFzgi8rZ58nZxqc2ZZb41ZY8PkujI/yrmlkZEH26PavP1cYOrHMds00eljWfMNvoaDnLc7MiOoNiny4aG2ItPM5gKb+YfMiyqhzHGlHwJneLre0+vqPRwn7uVrMDycTizRtXQeON4D/DQcz+w4nQdO6IHgAZGASbQxa4OSx50Gxudsskru7q3TaJp45DwoO7LU2V0K1SpUeVpRYrCqkBw1w2AlAVz5DxmRy1SzYogFdiIjt91tSJVURPpWsuCTqhT9N7ZJCDCU5VSLN3o6+kBJ6sEK4CxO874B/SVwXQ7ngTbZFLSHmgQ0UiJJJZ+tL1ayKBe31SdYlKrDQKNUKAVDKub5SwyCrQlPebJL6A0pcJsaaHIgNSmdmFhabXN5h+BNUy8fj4QVR0PeMWOiE7uErye1jnQeWJcHwrqkOqG1PLA1eR6dTjHz6UA3Ldp2dZqRvPVsHsGIAkdWREwk2BO65dmMFg/URQwqqPunfFiTE3lOt0FOCeiTBoJ+Y485j35yakbAR8JEINbkcDnHpHqmhPGnuzLEdHWlbJ6kcs3HnEh5X4f8MpaskuT+EPNQttmYg/kcgLd4Aovm8uJwXRDOo/0D4ySnHdPW1lt6TPPJq9mUfGksNzWVk/fqWjsPrHhg9SleYXWFzgObxQP++AJWHkolQbsAISNErweCeVCTyMSKjDBe18T5kYo0znVDLkRWVLGgn4N+zkOfoCL4GyhwSSC8BqgHawdFkloAAmdGvVeTeo30a6yVTCyiFOQHozC22xCgbkcgKQW3C1g05hHViyMpDcES9UWVzC0w1YI5FSRxy3ZXCjbGzlpSFF2h3dl5YPN7oPlZ2fzz6GawVT3gCUz+GBPwp3zgNQ/eoo14nlu8bopwpFxOtJIUPDkYSSuQKETdE4VTWiXCvpwviQWZmsM1tpBS1nj6NOsyjAABu7SC3JJtFGMbNrktbpdR91bzC+Ma9QaJBFbBARHk9qmLRSoOiJ/oTEh7cUNhQxq1oTzUGXOMB/yn/xhWV+08sEk8QABXDsQ8xrksAn+U8V4lsbXWbJ1JiXdGpAqomgPZJH8HVZA2Anz6ux74LhBNcqDIqxlej5QcECXGENckOCSIE1EMEstBrUkNDRNEq5XQEy2ptZU8Iz+cxrYN6vVWRubzYCXp77xYedGdLtjE1c/IuzSh28vG/DxRh5z4ndOh88Dm94D/9G7+WXQz6DxAcFdOKLVEAnPUIariCXf4Fz08EWQZcWVZlUhuFDk96Ffy9pSzQE4RDX+SZHLioEw3eVnteAFZZ4ZJ4zE0y6JpLdryaBZanEBNzm/r04k0C8hbKvn8mIVq5hBzQiaRsRmZvLO8RaqxLYaRYmBu8FJO1IXMkxl1U+TanZ0HTumBDS3Aj/iGtq8zrvPAiT1gHoRbENytJkzzfoh3P5GyB3FPYKNCBHspkaASfSKrE6QzT8iZxhJ9GoyUCPqJBLiSQMhPLp9BeZovRjxzmLJOuW1eZlWY9ZnyGCQo+WEuxTytkjI8UfMODNu9pTYmyDsysRoT/T05p8BakXnUzLWG5tzm7anPYKW4APRtvERmGNadnQfW7YEuia3bVZ3gRvSAJyWH2mBMkmrtTGQCD/CJFQrLD64j9bSofjoEPZxR6pBKm8ZhlelIhrSEqiFdx3lH0H9YPMJm6gUfM5FQTgJT7VacAFgYJTfZImX0mIOyq1asJRJskYYqsKWXllTqMHYfAodV6mCm/UQ5LasfhxllHMnznlmhiJ0ZCpTdchIe5ZVkyAgb7QzBl7YbzarOno3qAX+qN6ptnV1n4YHz0TUHl5Sy6hCCTvV/VWXB83rvErkLAAAQAElEQVSJ8t/tiqxImq1ABkulUuSxTgNZnFGsekpj00JZaLT/bg2W92p2ebf6S59RceTTKod3Kh35VwV4tnS7bLRbCV69eCdJ4n6S2Ug9puzoR5EkpB7U0Yd/1sBk1kY6FoOJ7jJVCqP7VC/eperI7YpH7mhsXca+5dvVG/6rZoef0dzwdg2Gu1WO7lYxPKAZElgamqx2fxRKvDvjwmhSIlFGVnQpg8lk7kW8mOXB/XmaPF653l06D6zHA2E9Qp1M54GN6gFfZfhWWSLlKBUykljB1lrw9z40zJSBRHRYRoB/0mOu19Mfv0tf/WWlnvRI6RmPH+jJjypAT096RAGvhPb15Ef29TWPntVTHr2gpz92Tk977ABaQBs8/bE9ygM99XEt2vrx9CmP7utrHlOi63jqbU9F91MfO6unPmbbBHPy+tPzGOh7zIye+pjtesqjtulrHjWLfT098UtNT/rSAJW++hG1vvJLhvqKL1nW4x8+1BMfMatHPmyOZLZP2wY9/CGOACVZkezFyjAZZbgb8+SmbUzDOqs2qAfCBrWrM6vzwCk9kNgWS2y0RTbVHOJ9T4gFW39BRRQtY1Zh92tb737dsGuvfvwHvlT/4UWP0G/8zBfoP73sc/RbL32o/svPfYF+72VfpP/ieOkX63df9sWUv0yv+bkv1+///GP1mp9/PHicfu/nn7CC/+LlX3icXvNzT9DvvvSx9DkxXoPsyfDqn3mcXv0zjwVOwUvBzzxG/xm8+qVfji2PZoxH0v6l+p2f/hL9zku+SK/66S8ED9dv//Tn6Vd/8kF65Utv1u/80ufpt1/+hfq1n32Evvvf3aT5cKe0dG/2QWA1pzBUho3wa5Qn/eirM3wI4xyd50SNnRMtnZIt44GwZWbaTfSsPRDjxtvsYdeNeflj7PD4V8ryiixApWBJQUPFpXu0vdin2dFtusxu1U77GOX3sRUHRu/V3Oh9GkBnhu+Fvp+tuQ9oUH1QM+MPajD+qAYjMP7wCu1T71Pfbrdpuz6hhRPQmeojmh1/TGtR523TLdqmW1ewkG7VQmp4C/AX7Bb036IFfUzb00e0wyGoPqqd4aO6duYTuqL4GGMwh/G/aBt27Jq9T0V9SPODGXxgao4IqcT+Iojwg4SftBGOjfdYbQSvdDas0wM8yeuU7MQ6D2w0DxjBWJ7GCM5idUEwNKrGVqKJt0z+XszmFOsetRmlxVrp0FC9pajBUlJvuVKoR8R1VimCppEUKYOYSHxAct2A90c0KjFmBPI6GI+XdDIYW3gnwyguqcEidFFj6g0o18sajRfBkurxYdXVoqrqsFJ1RLwkk42HSkeWeb9XgZG2qeZ92LLCuFYZ5zRa7mHyLJ4ZcOcCkBr/JFarytDGO2zjmdRZtJE90DzZG9nCzrbOAyfwQA7IhOgiRVZbkQCdlJNLSDnZeJQepVrDaqyixxZjYZrr9RT8W3/wMh2PJWRCHCukppxiJUesasUYmzLUy5GtuUh7C2Msh3+hbi0a61o1uk9Ee9hUOEqpKBobi9JyuaReBlNJe1NO6pupZ1IZonqM3WPmPd4HDlwWGPYl5jOYYRUWSuXvuCCPZ+RH4JVTwZarsQoz3h8aCd/5GwnLYQmLN5JFnS0b2QNhIxvX2bYhPdDGww1hXKgTyUcksMhlBEhExsqlPKJxuSSbrZTmKh1JizpcH9TQFjVKy0qDoNDvqbBSJQHdUbRURf7Xtx56wwpEwlAO+kG5TD1WSRnjtamRRTxRnIjWJLlUj5VImIlyTpxZZ0RvrVTHCRI059uGstqK46gx8z/MimwcgiolxX7SuBhrMR5hrvigGKoO6Df8Q7KznLj6vDN0FJN5QDbAmVhJY4aB7uw8sG4P+E/juoU7wc4DjQcIiDmYF4RNW4Hk8Ye6E53koMlyKgwkCGWIhCAO365LuZExqHsxQNsz+i8AJyOaB4X8LcRCVhe5d8hChPJQU0pyPcPhkvplIf8WY/DV2ExJ8iplZlpcXFZyXTQ6TVBfbSmmiU1qqM91AkZWSFpBEXoqSXZFUaxJxWEkMoiOpc4rLCiQgBpopVyQXIMV2OkwkqpRNpVM0mVLa+YwmCulItGWNGJ1aUUQ3TRkm7SYKfCB+zHKsL+IyjT4nEVyFIeXSWy1BSWqYos0g3averPwbiDBB3SELEQLDUmGPoeg4mCA3M8pVWQ0DVjt6X1Ff6mQo9mijbk3jO7sPLBuD4R1S3aCnQfcA1aL+ElsYqsq9pRUKgWCpYNgx64bK4VEkvFk5oERSrCC470zjIoHQw+qBWUjODpE/0QCSmGkFJpAWMQgWLlfNIQJ+KnoT5IPbYltMwESmhEQK8ZicaJEvRiX2sY/HTH573X5GENWMHVKCiPTgOTjMbYOBE9WKj6mYZhDXlct57VwnjhsCgmZiE9OhLbvWhQ1Sm4AyROn4TPGQ5+vSCLzcCRPLgzo+hMrqloVgb5GCr/CH44W1Supj5fJZVE992EtEvdA1ShKbB0GT/KVVNQm30INJKqK1VoNgvUZqZ9XdKlfKvFuUP5ukC3JUJqEPkeo+yp5t2huL9zkD4H66CtVREMqoieqTYCJWuLZ0AQ+z0Szz83b5JmW/ko9Cau5+DDiHlsud5fOA+v0QFinXCfWeYDIiBMIgMmjEcXmrEUkVkheiyLmggAky+GIBgNCDKx1Nn1D02RRE2XyeFmGUvWYCMxWm4JJrHhq3mkVMv4lVfBr7IlKBHbGQcb7mRXy1YoH7gFJsk991t8TFdKY92CR91q9HhVFubyjMWAjXSc+wSRPgp5EV6jBVFDhq8teqcFgRsF9VZvqUa2qqqgHfCAVwSmyMpkVQkQ1idtRsRXpW5bCr3ieW5kYJokCC1KoUdTUwb1MVsNwachRp/PoM83D9141+lmeDjLcLzWfdlCOPAmTAmJRLifNUT7nZ6fwEvVAfqwu0bl10zrXHuCVk0ggSmPyzIh1z0jmAYhP7ikOCUDjFbhcbvOkRJw6mSl8kD9Bc1BKCZ2m0OspH7w/UrWsQd9UBpJbPyr2asXCEQnQY1GiH9dUqa6HKr0rgXdcL9OGzWUlo08iIUeLWe1mvHjiZWGp5WGlEU4cjU01SSPy6aEokwYz/Hizekt5nmINJ41lGluhsQJ10wx+7CHTD4U0kkiH6vVmJVZoKJNI8sJHCUT0JEPIxlKGl4/1n+UPBfKDPgmPG0nLnDJi4D7IdWCBMpaRHMn8m6A8VxJ7uVqE152dB9bngbA+sU6q84B7YCSFijA5VggjFWxHeQAsCUoZBKkSFCQ284hIUPIAJoKZ927hwTdaU4srbW0w5JF0AYIsH97ziqJgldArS6liBeBJlHhrcYl3Wvei+hCSB8EBAvD9KuMR9XRERTpE+bB6tiSrD7M6kTzR9kiGxjuyEbFyeTzCCMbjuilP7kRR9hVDT0U5Q7KeUa8cyBeYZRhqtLRbpe5XH5TCH2FJheEbHVGww7Qd1Hh5j2y8Hz9WOEikuB5+KmWGk8XhN8G4NyQw5XKCOamTmCiRtIKnOmhWQbufCfHIODUYM26tHsmy4LkpeV68XBYVz9FYXs/PEx9KTKPkvTt0HlivBzb0T/B6J9HJXUgPjOUJxOolhbSoQssq4jLlVUhLMk9mOfh5mAO5LCValJOUqU1kEu3tFBIFgrMcCipIYP5lC98CdLli0NOgkKrhAc33hrLhXQrLd6gc71ZvvEcz6R7N1fdom/Zqm+3TQjigYnyfeiTNxAqusMDqrCQfFqzu5tWMw5ib9BxVUQ5fkfkW4tKRA1o+tFezpdSv79QgfgZ6u/rVZ9QbgTGoPq1y9KmMhf69musfUqgPyr80EtE3XB6TyLgRRZDfLlnKtyzftnyBT7OOPfI9a5i4W96vZK/YVEl86EjAnxVLrL4oBz5w+DNkPEdOA89RYXWaiXzCUHd0HlifB3ga1yfYSXUekIbSeMlGowMaLt/HJ/39E9zHJ/r9JJb7wUFVy4cVR4uKbOUZn9ZtOknhRo+Da8VAmjh5JD0YZphCoE5MS2xJednqStV4OX+q/4rHPkxPf8ID9ewnXKWvfdyV+trHX6lnPW6XnvH4K/SMx12lpz72aj0ZPOOrHqInPW6nZu2whofvJ6EFDcpZEjCRXpv76JHkZ3p9DQIbgV4OUTddPaeve9L1+vav+wJ9xzMfDj4349uf+VB9+9Nv1rc99cH69qfdpG992s362id/rr7k4VeSqw7zQWQsTzwhFDJf+fp7KzVH/sDBjYvCZ4l27o8Bb/WPIMmCaKYagJ8RVVE8BNyvRY2HhzRePpBRLd6v8eI+jRb9meHZGe7L/NHooOrxknfu0Hlg3R5on7h1d+gEt64HYoxBcdivhgeVSGJx6T7VIBGcInB+tbRfCcQckBYJjASyFZcZJX/kQg54HvQ8mTkl2tHGmSsu47JwCaT+1fgwSWb1aMz24EgFW1JP+NIb9f1fd7Oe9+xr9EPPvlI/+KzL9ZxnXK7vffoV+q6n7dJ3Pv1yfftTr9G3EbC/7t8+RNfML2tmfFizKarPOPVyxYDHnpun7h5Ko4rVaIXPl1TwwWEwOqQbd9R62qOv1dc+5go99ZEDPf0RfRD0zEdKz3pU0tc+qtLXPXKkp3950Nc+8UY9/PN2SON9rHvH+FWsfkOG8P2KN0hYnqjk3yZcQcF9DGBF6ugCq+/EKsxXwFo6gI0HVPOcJJ4fQbW8Xxk8Q5FywvY4Xi6Xl5ftaEVdrfPAiT3g0eLErV1L54EpD/RzeWymMSVWZWwlEpkosz3kW0T1IlkHeJmtO5ZjfML3JEaqIggieNQJd1J3mUkxE49h/mgGRd6veQJLKYkkqpIXPnMzvfzJvWRlVQxvV3/4afDJjMHwE+qPbgO3soX2Cc3YpzQ68jEC9N0qi0OamYmq2bZarpbkyTEPt4kvRWkquDHRahKPWP0MZfUBDYp9qhdv03zao3nbrW22Rwt2lxbCbu0s9uiy4m7tDPdqttjL1iMroOog79O4fbHSeDSS+zsrFAcJn5P1dCBh+X1hNeYrMrxKaz6be0mb5erkEhWsltKoQRw21J8Pf2fqYFuaT0TwvW0ss2GadO5I54F1eYCnbl1ynVDnAZEZ8AIJx4ORv+j3IARWkloOThUyE/B0mSUFGf9gH5vI/JM6oCWfiMpcxmH0mcC/Du8CZib/Ong1HmpA4E41gc96JKWCd1wBGhALOQAnjVXzbm4UD8kGQ1XhsJbTIS0XQzBWNag19G8osv1Gp0151vhuGCotlZVGg6jlcqxRWSv2osbM1XhnWHFP6jgiASVArlAhHKJgcyqtUJmWpOqA+rguViP5Bwbrlar9SzSeuRzyI3JxQDibe0Uha13ly++dUEZTIB0FVr3cNMl/2c/BBwiR1Ew8I1Bxn2SUHdRTSpgQjO5b6uwme+YeaJ62M+/f9dxKHhgxWQKnMgg8pAlbA4LnMALYiaMREQ51K6frXKlQyMEwKmV+GyT9w1WbKQAAEABJREFUcTVCpMlSRWIcS7S3MoZKR0DcacH4BbYUBEoj2Jr8cB1hRS9dnHnpICedlH1TaEjKquSrIfOk4asikFjdun/cHwX+IWWx7esuCPhFMvMWNUdqiOiQfxHdkw2+FAgA9kTgBIT7I8ZwebkNuez3rpZNyoL6syLXp4rBF0+grGN3HjjeA/4TfTy343QeOJEH+EDvAcfY3vOg4/Bg5vBy/lStit5kEq5+Bg+sGTxuOTk5dwJCljc1tdU+ysHPuZ7IlIOr10T/QGA1Al+wocyOTDBUYFXofwGkQKasS/Wqki3FItPBuK/BeDBBj3djffXrMAneWfOmu/g8B1XBXHoaMNc8X593bcwtqscKrM/2YC/WJDP31VLjq3BEvg0caCtwuaVS9GAlW+LnoERNeNN9nQFHfk+NTzE2huUfHgD3YPU+te4L6AaTKiurSamWSKDKicq1M/CkbBIjNqNaUslSzFnqjs4D6/HA6tO2HulOZtUDW71EmOH0UIcnEmhOghCFph4IUlROcnogO0kzyvz3yBxpJcw1j6zrZgNRKTRB1anLZW0ksTCBJakA3quIQRm05VUaK7Usv0kveW6xVEky9nkF5mXUCwdzdp45L8/PfV0psf3YrFzdI0GWChUkMQH/4oYnnWR09j7+QYX+4lOG5XtZq0lEFRR9BpQmd8bLmjrCajnLibEkhNUckWdn0mdCGr6sS2ITT3RkXR6YetLWJd8JbWUP9Fcn38a5Vc7xJQ+IDTcQwBo0dRHLjo5cIhhqOtjloAmXREMM9Q5SKMQlA21Q2k1i4ZFBjoKS2gwE+CGq5j1MTeCObIM5TYwRc3ksp9KxdmS1m+qSRErP85KSGT4omVWhpBIMlNKsavVVm28cOg+kgRRnpPxNQ+oBHRM9eXnqN5gEZhMguHrP8Lngu5NC8mv0yxQQSCDrg+2yJMTV5wEebcrwMtqznqbcXTsPnI4H+FE/HfFOdkt7YORZzB8Zx7QnbKWSY9dKjYIHMMhap3ngckw1Zh4h2Fm+skoEZ0KcVyGBQBoor46nrN95DdrxPazm/mGk6EmMhBYBixaCeQAGpFYepZvhPMpGt72dZ+1zM5I2CTzhpUSCiFCxwhKrLVF2+fxBAZ8ZfF+1iXIKNvGDb93WiFb0TjgH0M9SIK9N+ZxWsUGprFf5MERdTnmQzGou9EWRUNMAOa0cfs9WKiuFGONRUisNXaHzwBoeWPspWkOwY3UeWMsDEWatNEk7VPw0v6wNb2oCHu0EXeWAOPUYZh5t+UQ79SaRwTDCIUHaPIDSzwiQIRYqYi8jsBQzID/MA7Jvn9WKVqsOiaQVVLEaqayvKvTht0nZO2xOeGKuish8wITmuZLUUvaXzws/KpFHPDmN8dwor9FYf8HztigWcEqsWkXSF++9JLYMWQVbIoHhY9FLJD657/PqDd8l4OrxtZNVBIrNym5l9eXGwPUzcYnoi1BBM5lcotKk1JHOA+vzgD9t65PspLa8B2KZPyETZXhsJkGJSg47K9RaN0WSRFtG/qhg1YQvoiYC3qYsm8y1SK6iYPupICEZ73ds6hO/94wIeIgsEHeZUJckMYKtB1yHpg7quYa93i+SBH01lrDH66jIzVgAjWByer8WmeVtLaREf0duOstL1sNYjS1RKSeFllbUSShHjRFzzeV9tSlRn/QRPmz6ZxGaaolklP2FWCAhFSQir/v7rWS1LNBgPgYUOzxZGTSgIqiWyykfON4TGW1KlFd4Lpkrp7gg13Y7ShL+VL17JzbljI1Q3OA2HP30bHBjO/Murgcmn7vln64jqcaDKERiOypTwz6CqDwohtyqxGf+SNBMDjN5gE3IeAxMJBTxLiajJGh7PyEZpaJOwNTjvU1Z+fubJBFoI6sF1hx5iB5K8moi1RKB3FUlD7rUAisui31iek+BlYMReN2kwAojyLcYR0rok0WkI+UpKFAH2CzKCMhIBCLgi3GwhGuRkXJ7RORMICX6R5AYKxpjMkZkJZSwK4IUeHcHEiMkl3PeBIIGrAjMuZmbZD4/bDXmW/AhwP2TQeYu8Eeo56Vqhh5R0YZSQfIqGMN9gX5L26R6FpiKQpLLBOTkB+HCDVFUgG/4UYKH7XIkQ8jrEGT8mllYJebm9QzEfH6JSoOohkrGoe7oPHAaHmifuNPo0ol2Hmg9MPX4EDRbrnIAiyIiKR8rbR6qnA+yDK0xRzQvTAAhya3oIApySoiRjaAEPC8TwF3G26oc+KNclQf+DMKit8kPxg/AMqJcvQd9p85zES87nUbLO5auJTPNO9Oy2yTm5YlJJAe32XU11H0d5LYcD4PvbQ7v0cD94T7KQK+Yv1hJ1SSURNKq/QOB8ydjGQ4zVmouE+F5/5r3iTUyXpb3R7UlLuLSFKQJHyNoiBNA6Md1cjp/UqRrU5riNYzu2nngtD0QTrtH12ETeOACmrgSkCZjej0jkncaeFA2PvubIkLeyKd/AlxgxVCy4gqAZnlcFDIeYCPBs2KFUJVDORUBV/QhtopFhTyostDQyJIqnmLHmBWLo2J1kXi3E1kt+Cf+3I+RC4Yu2J4sWJGUdZ8tSJC3In07slRAYcBEt9NXXoZRTgP9GELyIE/Z2wuNWXuM5bqNIH4mEAfm+5TwVQJRXjcSjWGj1QOm7WA1SXIJTLppDzLmkeGyQFlLNlGYOQFr1qJFpaocNcA/7qM6MJ7rYZwi+yNIxqoW3yX61aywU+gpBV/L0abpw+QWS1G5j+jnZbhyWJLfX3Me99lZ8iOJeYIJ1fGHHc/qOJ0HTuyBY5/ME0t2LZ0HTuAB4lUOTB6o8gNFgHJRD2JOc1DLhSiir5qjEQoE5rI2BQ+mORgXigTkGkWegFJW7v3EAZPUUTvYLhwDD9iooE/y4TMi79MybyocetFIUkbCKWgsSAoOueX5nVtQoE0cnriMbTm31RMwLIm2pj3IknOwSXFS9vrpw7BHzPVofejHPsM+wx+BZJbBmDmZtjQPF7CrBE4ngI+I3C8OVClaPArKdRf0PiRvxhG2BJ+jz9sTUh4MGVZtwkeuy/uZmqPRm0eCERkvZuoyDveh8sRchrZcRmRyMjIzF5p17NEOcSy/q3ceWNMD/iyt2dAxOw+sxwMecTw++YPk5ZU+1tY8gAFNwTsgmOMkATT4t9zy7y0NpAi8DF8kK3mC8XLdk1gxtO21Bkq5vczJxwjA0xD1VUwCPWEzEI2NuNpC8HJAdgq8jmmTMyq3GWbld3t9yW3Jco0I6pSonxHQ22g59tok1OBz9zm2oZ5V0kpCokseGx0pJxoYnEyNKyfzj9glaAasfFIPExjUeckVIevvOvOqindyysks0ex3NpCPIuUG/sGigbJ/aMhnsqYdrpTL4t5IcjUZMc8kwDJworP7YseJPNPx1/KAP09r8Tte54F1eCAS+pTRCE89TgRIM2vYk2sTbJHJQdPkvT0osxBr4hzyLpOmNBZJChEFDsp0kkE9YLoa11LSVhIeA2MGkkyhnpw6RPIx+FrRSWdXQEJIIBJsE3XXdTSiUm5zShwmUSTGyHrQRxeMOhcnxudJOUWfGzFtK22RwWJra2DFCSJOyaJ0WTmxVxNEc27gQkL0KzbTTUWSzMtsowYUpPylmEqw1fRxO6YwKWZ18gMGYyQHVVSohVbsxl+0+YnpTjLDmtKprusUO5Warn2reMCf8q0y126e59EDhDZCvMcff6QAQV85qFEmaCavQ+UgsSRWX+xgacw7r3FvSakYIT4mIPJuxSoJGNtagXdPZapUprHKOGKMsQLvuvK35qB9gnAZo0q69Vi5FCCg2NiOCyQ0iyZ5lJUfUf6uLdlIKSxTHsnft1W8I/L3Q3kLU0HJgb3eLQdri8o0kECwQLQ7LM/F1U/aW7nToEI2w82b6PViDGPFMARjbHV7R5QrecLPIIlFI/nYZOzg5YquMQNTSeQkMGw0tmoRV8AvBfA/U9XDP57QxBh1MVTtPjChn/uFBqEm4FPU008qvC7mbzQ6INnu7KQCJ5RwvO80YE2f2OJVVKHJSx06D5ytB5R/as5eS6dhy3rAA5LDHZB4nBz5sSK4RRJBLntjC1ZbyltkHvhIGB4lffvKiJhETmNJ4NAk4Hm3kJKKFBVIWAUwIevyGUmWdXgAr7DAaVQwelqSQPKIju40CfR1UauGF4nSiUQgb3MdouT9oH56/msQ5QlDvsVmtUSfkO2Jrl7e5YzRmNjooSx5EpB8DHmyZSwxZjJNDiMB4DvkEmiYEeJ2TUCtPW3Kj8xOcn3y+SRFfKM8p3EuJ+5Xyvemhz0Bn4sPDjHDRS0bEaRWZ6bU+VCCYinbU0za4SOf8v2mCS8lo8mLIE6Qp0x56kRqqtYVOw+cwgM8aaeQ6Jo7D5zEAx6EohL/2kfJKXGIgOjBzt+zEFqJXs4HHviAAeWA6cqjrDCphlaJZMWnelYKiRXEaCQNBnO5fxxXmhv0VS+PVMMvQ6GaxOT/f1ZFYhppWVX+Zt1QVTpCqlvEhJHGcYnyshKJqoqVyl5PMiNwo1ZRFqKU/9J7UvBvSkYjHBcyaCJZid7BE23wvwK/RNsQy2sZfQslWdKZg3ENBPwRmG8GZQxCaa2ixGcS+gMmBtLFHGPPq7Q5pRF+J8H3kEnMK1ZjbMOYbLMUQim/NxH7I3OM+Mj9VJVjVb7ywnfBoobLi8gGWSikMYgD9XtziqNIIosqmWnAFyH1ZLEnsdrtWY/7ZJRLECSBnKWgFmRmGTRI+RNFQg7/BjimbBecVRln0yeyql5aWqLWnZ0H1ucBf6TWJ9lJdR44hQcSQSgRoGQEwhXZSLBLyisAVlGKNRGsBvDyHwDJHZQIXkbw6/dK9cu+inKgRKDsz83ryHisEduJRG8dWVpUv9/XwrZ5JRhVhqlGjcOHziiTQgFYcQ16Qb1eqbIk4BYFSS2qIijXdVSQ+Rs09egfxyNZXamEZySU0mZl6kuMEbnSRUxGiaCczGRmSiQRf6+0FuShmjmv1dbyDPscLhtJKBGdbpUnXMdotMzIkgW4llSTyOPyssI4alCSUPChB/4QgoqAnESiMdQVimNhLrPBj+Jo5sDc0VWBaGIOtLOPOhwuqcJWHA8zKNEWSuYnPjBoKBTBg898mbQqfBerSsYcGVD524hKYmDJkyiJ2WnyMlyYEvNzvVo5MHhSNjMl1y1Uqjs6D6zfA6tP0fr7dJKdB1Y9YBTbp6gJQjD8TCSISoXVCrzfKY0y23cFq4GCwF0SRIm7EklFHowJgIkgPWaJNa5ZKZBMPPCNTGx4jZVmTMW2nmoS0zLvyA4tV1qisdJA0WYUA8nGSkUVSkRnVMkxGg7lqMe1qlGNMgIxq42ymCNxzapgxRfhB5JoiQ2zvVJlIDlUBf1npbhNdVpQZOXj49R5vJ6c1iS4xCrIyIAOsp8cXnZMl71+PCQxlCP2sK0XJRKHL3YiK9NIsrReX8JfMS3jx2X1bagB6MVFtvmWxcYrzsUAABAASURBVNBKJBSfa8HcjUxeqKdeGqivORmrquDf6uQdpGhPKlVbAZz2NKpmVPYXQKH+QIhgQ7WsUc1qaFAr9saK5UixiEpGm9VCPfejEFlUxmqu5A4VvLsMGnHPx8BpJfkHD2DeR/RFvT8iTSIL1NY8LQQmvmZTx+w8cLwHTvgkHS/acToPnMgDttLgwZToJZY0kErBKsLmSIWNVNpyRj8MSRQj9UhuRGAZka2sFnWZlrRjeEA7Fvdr1+iIdsWhti/ep50E7IWlfZpfulc7xge1ne2vXeOkB267Wtvids3pSuiVmo9XaK66XLP15ZoZ74Jepu2Da7W9uBKZhRzU+4HEVAcFImmKPP51T4ktzMKC+iQQjNFwNNY4zoAdUnG9YvEAVeWNqoobNepdq1F5rca968G1GlEfl9fJUcFzeNnRlp2ujRs0LuhbXKNx72qNy2s0Qnc1GTOWD1DoPQA7dqnCnsg2XslqstfvK8jyqqxk1eorMWNFlmrJqkJF1Vc5nFM53q6ZCl8A94tjUO3SLL6Zgc6NrtC25cu17cis5o4c0bb779WV9VCXhUo7RofVu2+PLqsOaCf35PKlw1pYPKhZ7kt/fES2fFgWj6jgngVbwp4lykP8ugiWZZ50NYZWbimGYdwkkSnphAerMTth49k0dH0vWQ+ES3Zm3cTOlwdOEoJEwIqAgMVeViT51KNDBNsDqkf7lcb3gwPSeD+4TwX1eT7x7xju167Dd+shdkhf2lvUI+ywvqS6X19Cn0fEQ3pEAjqgL4kg0V5KD/dttQ99WjN7SoW7FhTuuQxcIdt7pbT3Kmnf1dK9YPc2jff0tHiXqVieU7+eUcm7HeWgHxWsp7KYk0LSIsH5yHBR6s9odscNuu/wNt1z6Ardfeha7Tl4g3Yfvn6C66DXghv1mfscN0FXcfv+B8nxmftu0h33PziXvT4N52fsvxmZm3XngQfqzoM3Zuw5+GDddfBm3X3/Q3Q3uu49cK16sw9SlbbryHLQCCjOqt/fqeVRpTErsUgS7pVz6vV3sbrcqXRgRrpvXroH3L1N2rMg27Ndxe4FhTt3yO7YqeKO7ep9ZlYPOrRDjyu364tIXF9waJ8esXxQX56GelxP+vylA/pCEtYjWBl/OdHiUQPTZ/OBZNfSfm0bH1QY3ac0ulex2j/BASigLQ793h+SsbqWeCbEkSaAnOBkIRbsBG0du/PAcR7gsTyO1zE6D6zfAwSloDbmJD55R8mXBARBVUtaZgU1XNyn8dJ9Gi3thd4D726Nl/dqtLhXi/v3aHn/bs0QCL/4ylk9+/MfpH//iM/Tc77s4XrOFz9M3/+lD9e///yb9X2P+Hw955Gfr2//ks/T9z36kfrmL/hSFbfeo3953fv0/j/9mD7wZ7fpI6//jD72+tt16xvu1G1/uUe3/NVu3fbWvbr1HffoU++/V8N7o2xUqmduca3A1uSwSqpCIZgKsz3ZXI/VUakP3naXXvwLb9P3Pf/P9Jwf/mN97/P/VN/9/Dfou17wZv37F/wVeIO+8/mv1/f+6Bv1PT/6F/reH/mLKQr/R15P/fXw/xz650fR7/0xr/8ZPHS/8M/1nBf+hb7vhW/W9/3EX+r7f/xP9f0v/P/0/T/2J/rBH3+dfvBH/ky/+XvvIKEFhbkd6s3PKrHVWJGEK38n1SsU+j0Voa84IlUcGOve2/bp3X/7Ib3rz9+n9/zFR/S+P78F3Kr3ve7j+OtTGR983af1wdd9Uu/5n++SffKg/n9f9CV63uO+TM995BfoOx/2WeBmfecXfY6+75FfqOc86gv13V/yBfrWh3+unvm5N+nzd/bUW+IeHrxLNfe04l466uV9ihn7VQ/3azw6oJqVW+Q5yM+EmsOCeGKMi4mVl6YP6rROc7py54GTe2ADPzAnN7xr3TgesCSCUgN/oAhNJLKkFJelMSub6jD0QEazGrtf1fA+VaP72VlaYpNpUX0d1rX9Wp81iHqIFvXQ5QP67MUDejj9H0YgfAgrggcdOagHLy/ps/hQ/wUE9G17ljR35wDs0uwdV2pwxxXq33GNerdfq/KO61Xeea0WPzmnIauNxd2F+uMdkv+SLwYnVokqRppZmNfITPuXD+lIXNKwjOrvvEyzVz5AH79b+tgd0kdulz78mQYfgn4Q3gfAh8FHd9O+R/oo+AiYph+9S/oI7R8GTtv2tp5laXPqsh+m/0e8D9T1+tjv/7T0UcasZhe0aGNsPKShHVYajFTMmoasciq8KBJxEWZUDC7TvHYqHJpT7wArrXu3a2bv5Zq7+yptu+sqLey5Tjv23KAdux+o7Xddo/n7d2iwb6ybLOoGPlR89vBePWy8T5/LNuJDWQk/mA8hNw8PyvEQtg8fOjvWVcVh7vdeBTugutqfV15CXmPucQ2qQ1J1JCPVy0r+XkyiTwO1B89NW+xo54Ez9UA4045dv84D7gE+TzshQHkpUnZAOP0LB7JKDUaSxqBitebU68sku2UFDVXSMh+i5vnUPnvkft7RHNCu0aJm9+/TFbyj2gUuGw51TaxU3nuPyv1HNLtcqr+0oP7iDs0c3qH+4QUVh2akgwOl+weK982oR5AuDy1IhwoFmxWGyrcOawJ/CIFEOlRVjVT2B5pf2K6KpHDw0CE2v/paqqTDko6op8UI6kKLtWlxLB2m7VAtsfDRIaZyIno/bQeH0rHU5e8fBt2/3Ne+xUL3kuv3L0n7J/T+pUBilWDpABfjPVgi+YZeUDkolXz7k63PXhnUKwp2R00jthWZHP4tFJYGmhlu17al7ZoHc0uXa375Ks2NSHLjXdo22qW5Mcm6WlCJ/ivNdBkfGHaypboDv+8Eu6qhrmRbeNd4SQuL92tu6X4t0D5TLcqPoqwVuKcGhMfklISVqZczRjKrgfcAnrii8L4XHPC6s/PAWXggnEXfruuW9AARiLWTMkQwInylSM3TQuS9jQioOKaNT3lrcSSlChDMMt8QcD01vKVJIKRI1b+k16e1x4ooEQQLts78q/CxYqtvXCiMR2IBIhYOSM0okZhimqVzz3OTEqsrlcuyMJT/f2Pb6jmC9ZxmNUAe+8qxlotKIcwRa3vqsVpcKJPCWBodGmqGJLVQkCRGUWUhVfSqVDBOTamWuf0gMAUDFDUNTfHY8TuqzestPN/kX0lj9sn1J1OMkrfjTMaiwhWzlLCjx4pmUI9ko0JW99k6DBqEGfXrkG2vUWa9UgjIHRGqUoNqTr2RVFbI8A6txgsjDB8yWf9r/zX3xG/PTDEj/927AhsqjLDQw44gsWpN6An4xBNWUYyx1lSNkhhJw3GdU1dyB7i5Dq/wPIh7Z+bWR7FFiD5BgRooTzLKzDvD5DQz6lMMeN3ZeeBUHuBJPZVI1955YD0eiFloNSTlKhfnTwPWyun8Sjape7BjgaHC2R7L+ATfNPGYJg+bJW2RGE2fBI+e1BRbBaIjK79EkFZOH1FFVQCSUuVCSRU6RyDSNxG0fZhA0A02ULAZlVYq0CYSS2TwegK3zSg7heSA7PRYpOQcl2zh9ZPBR/F2n1/Iel1FwoYE28d3amaTBFowtZ4SdppbSqPPISIfLUhk99qdqFJG9iuYR+HfwsR/Efk6kHhIRjVJPmY/0SU5gvKBX7M/kRflEAsZei2nq4iGLJUvPmYuTF8SFc+MwH8XTn5PYB1/RlgOSHd2HjgLD0ye3LPQ0HXtPHAOPdAmifWpJGLyaT9MIJKTBI/OybgQcitITZkFCy2JUJzkbR4+PbaPqIytp4otw5h6hNye6lw31hKiLrnGhA4H6lbOJmGtVFcK659DpM8Y/SOopyuvswCilrCnJgE5p8KAOvZVx5IVTYGtho2sU0NUVURFVpbkGnnyQRQZdGBchWbn1cj5L1InEpjwlWwosyUVJDJZxWjrP9c/t/Xr7CQ7D5yNB7okdjbe25p9PU6e15m3gXI9AwVFWYpT9rTZxgjhPN6cnnxcl8MsybwPAd1Ieh7Yc4A3kgE9IsHfx69VIyWurrqWv4+iySvrgutwnErYlCYiq3NIOfkmxg5A8iScWA1FVmPJ7cR2X0WlMFIiEUWfB8ko0YalcniC9nlHtg9lhbysPCMfLkrISu3YOu3jzHue9lBdh84DJ/UAP+Inbe8aOw+cXw94zmEEwioriESYTWoCLsxTnIagxR7xuEc8btGnzDsjttNoVkR/JMgLGGuYQIjP8NUI789COZQK3qFpqEBSMNotVMooJXbUlF86GcY4ICLJrCIzzu5ix3ePpNpaMY/PziG0VihqGbaG8gj0sBJUrKjyyop1ozE/1+QJxpNwHZJqY7Ygus1sL4rVXUh9BVZ1Ygw5X6d3rCc5n57GTrrzwJl7oEtiZ+a7rtcF8oAnoZMNZfndjScuzzh93il5Mivo0j7aEV4SGZI8VuT3Y2XdU1n1KAeCeVDBUqcg4/kXIAr/EkRdiPgv0S3H+QJ1fppfWgQKLSiewdmqMx/H+7eUwRPMxGopr/6iFLCpV5cqKZd1UohRRWV5TiV7iT2fU91nXmWWNRznycbMxNTQ3tgappK+kcgYirYzO/m4gXvszDp3vToPnCMP+JN9jlR1ajoPnDsPpBOo8oDsaJqDQl4qFYqsMGoCtlhZRFYeK8GZbbaChFAQ6FUP1Btt08zydvWG29Uf7dTA6/U2zY8XNFuBuF2Dal493kFZdG2MlAAnagjaymhYpnN+TP1EGgN6tcCOQT2jmfE8wP7xtmx3Hzoz2q6Z4U7NjnYwn20S8ynHMwrMN6TGPjOnKME3RuIyT2Se/FmtCt45n0OnsPPABfSA/4xcwOG6oToPnA8PsCYg40SCvq9eREpzGNtrnsACCa6X5iT/ZefhldLyddLwegAd3ygb3ahQ3aBQ34jMDbL6Ws3FXZrF1OCxn4wVAOqV8wH6TUbr2Z+uJf8Qon9apZnJSNAFQwzAfH2FetU16o2vlY2vVzl6oGz5gdLidbLFa2VLV0tLzG1plwaeoFlpZtvpK+wN+MIAy9LMUZe8Jn7oyGb3QP752eyT6OzfPB7wLS7HWhabmcxsraYT8MgwNpJADEOlsEx5rGBjmcYq/GvedVTBqmShd6Xu/8gB7f+XJe1916L2/dOyDr671oF3R+37x6HuftsRHXjHUAfftaw73rpXH3777SQMqUiSWJUJHUbZAUcJ/Uk1RWzgeqYnKpuuXnBVDvYQ/b+mEUnMk+eA5HvLP92tPe88or3vXNa9bx9p/zuD7gcH3tvTgfdTfk+l+/95Uff98z7tve2wdpS7lMaRFRk2+i8g4xMBC5XI0mAkeVIjwVE44XnsvfJ6Bj0MLyc8QfGMT9dlZuTW1Oqw5WXuY1vraOeBU3igS2KncFDXfOE84AHNceyIK+Ht2IaVepSvwJIlRfMsIMJrzAhKqpeiDt6zpDtu2adPv2evbvune3TL2/foI2/brQ/+7e267e179a/v3K+PvW2P3v/Xn9QH3/Yp3fGRe3V4v1h52A7KAAAQAElEQVTDBRlbb0FBRx1GbTIWpbM4j9HrmphwVs8M5mxWy/tH+sS7d+tf/u6T2HinPvWP9+oT77hft7ztXt3yD/fAuwvs0W3/uEe3v+8+3f+vixofjuqlPhpahRUzqLySwRDy3UZeneV6d+k8cAIPbHj2Gj9BG97mzsCL6wGPrxfFgumA60E4G8FqRYTnBCKf6L3s/ICAY9Dra6Y/q1mSQX84qz5bbduqK7UjXavt8RrtqK/UQnWZto12asd4ly5LV+uycJV29i/XjrJokhgKjXRgmXJZOYNg68wP+mO32ndT2LyqK9JSq07LKoZJ2+KCdukK7YrYXl2ubcMrNL98hRZGV4OrtL26gjmwBTrawfuyOQ3ijPqhlLJ/VrXmzJW/pRhgOiDd2XlgE3uge4o38c271E2PnjUmk/RVw6Q4RYLMgzQrJSkQsEsl0o6mgvRoNFKqa6mifVyoXOppMJ7N6A17mk9eHqi/3NNMPaMFbde2sJC/Vb9U1eSoKMkhH4HyuTvTRFVkFJvWbmIeUcrjJoWYNJtmNFvPqhwGhUWpP+przhYUhmUuz4znaJ/PZS0XqodR42GlZJaBMrThA5WS+yuDuvvPG88ASe0MzqBz16XzwDnyAE/xOdLUqdkwHthshkQMbpAUeR9Un1ZwDAoeiAnKKQfoPkHa0YOaQgjyv7/YC4X6Vsj/G5Y+2THEmldDVUZJuUeIL3mHFJdHcgRLmhEq4Ev1SonC5PQfHeBjTzhnRuzobl6dwH3CLFQWJIuqUqgrtgiTBiGpTJWsGmpAkiqR96/eF/7Ve/8qvvrq9XrqDwZYH1YgT5TZXnj0ww1Hj73O2lpbvuvsekqx86n7lIN3ApvSA/wUbkq7O6MvBQ/Y2U+CcMw6JkrT76cmgVoE7TpF+R/HrevIioxkQJAPtPdJaIOilFEurSf/VxD8y9QjKZboLLy7/EjopqcXp+A/OjZVP7MiVtExKZFqGJTy6uljjqn6ajKScUrS6kwxUB97ybFKFckMM0oSdSAp+bwMuYg7ahLaiKSX8EE0vISpeR5Q5bHQbJVkUWdyuG1n0m8dffjcEbKV65DtRDoP8IR3Tug8sAE8sFZQNDt5LAuskExDKSxJBrWRmgDdBuagXtmXkawSSUsEfzhi4ZUTW/JvHJIYYsWKBYQ0px5biUWYU4xB7Mhp+jjKRg/+nkmmBU677HZO42gF3kIqVa+3oMK2KbHdOR4FOcT2Yr83K/9L8v6fY/oKxlSoLAes3AZSKMXE5X8z0r/sEgPp0mp4Q6ViSQmfpYDPPKFp/YePs7b02XMnugOHnb22TsNW8QCf47bKVLt5bkgPEK48WHuCmASxbCZsVkRSMtYoJAwI9SinjUDM4TfRJi9BLSc1VhdeBxFB/z+2xhWyVIxEZmYya0CwVDMmPwZsR3py84QgVm0lsjMkBVTkEw1olNzOzEgodGSuZGqO06GNLHrQ0ZQbHatXEimVYTUm6Y5lTL4ssKqcwQ6Tr7T6/b6KosjzGMexxrz/89VnMy/hMxRMn/hptdqM7XX3YzLJEx5XWN4GmZw1bS7jbUFHt01EzhUpuC+Mdq7UdXoudQ/w03upT7Gb34b1gIcqFgzs4GUTA09jIhHxyoftvSD/QoMKEbCjSlYRA08+BNB6PCKg5y6qEHCIKBuIwgWB3t9neTDOQZc+KoJcN0sZdI0lArm3V2lEfUR9KOOlUvTfoyrHKiiLd1D+NRE30ftFxke9IgzMzL8/VpDECkmw8pbG6VLXE+jptJCyTkhzmpOYdbO4koXDkh1Wzb8qJuyVcBDJDQ7vERXgZSWVov8XK+Z9GxRJKlhZmn/hxZ09gcWefCsypVp1YaxpKyX3Hx2SxqrqZVakUTGYql7SIhK9PvXxIlYz/jk+zcw12nA4dNqh88ApPeAC/vPjtEPngQvvAYKrgMdcH9x4P2Wkr0S2iJ4tCLpVLSVCec37H3/PIwJqb8BqJG8R0mYhtwsZ4q8cUpQfrsLh5QbOb9FwXNYTWiIJ1KFp86BOrkCgdK0y64tcmYGJWbvRGmT8KzISAgZOh7psVJBU5qtRWjlTU6ogFclSbJUGi9SYL/5J2UCvw+L0ks/D4XNqoOyP7BM3/CiUEqPWrNxQpzEJpA6lxsyOhagKVnezgzkNBvPIlRpiTwrWJDWSXoDbQx5yrk9GOtcqO32Xsgf8WbyU59fNbQN7wIPrDAsjD5Nz2NljhVCEPkmpT7DsEWNnFGxOZbkgFXOqrAdIKCxNRqy8qmj0kgJpxHU55KuU0wmDBGYztuPQImiERhJjJIHWlCsSTMQuJcZNgdxQYl+pimRbqQ8NhH2Cu84E6ENHmkDoFImwoTPMzbcNe4qRhMP4hi0hmRLzdiCw7tOQPBZifv7hQPhV+DTMzsvKeUXGqsal4qhQDcbDwJh9FSS0yP2JdcGccUWMWFuguTs7D1w8D4SLN3Q38pb0wNSk/eErCcweBgvokbKnfbN93bswq307t+ne7Qu6h/K9OyjvmNe+7WB+Vnv7he4rg8rLLlcK3lsyM53RQWJKMoJykJHEEnpiom6lTAPCPOm1mJcnURWeTL0MbDtj0xYc1EMDK7bJEcoFObx8YqAvbJPZNsmRdVHOurapgFdoXqWPT1JN2MWg2KR8mFmmZ3MZzC6oZmV7H0r2z8zovm1z2ffu/73b53QfPm9xYJ62stBodo50O+CODfCbsN8ydI6OXo+9y3Okq1Nz6XsgXPpT7Ga4UT0QMWyJMHgQ+mnWNH+z+zb991vfr//y8ffpP3/i/frt296j/0z9VbdAb3ufXvupD+r3oX/4sffqzz/5UX308H0a9QqCveXAHqRMLSVK6z+bL0EELAlKrEqSCnJFDwWzGpSXaTB7ucr5K8CV6m27WgMwu3CNZrddp5lt12bMLlwnh9db2pa9viboP7/jWs3tvEbzO67Rtu3XZszvuE7bvA7mZ3apx+rIV4KxNmwKMuzzd39eUz4C1xYU1zhDirw2cwjaIOGtxVjr1n336PUf+YD+2wfepd/98Dv16lvfp1fh/1d96l/02594X74Xv3vLe/V7H/hn/dEH36N/ufdu7Wc7c6R01EhmdlT9TCvj8fjcKDpTA7p+m8oD/uRvKoM7Yy8dD3gQDUVfVgx0mGm979579Fd3fkp/cfftev3dd+jP7rlTb9x7p96w5zP6c3hv3P1p/eU9u/VX9+3VO+6/W3uqoWq2/uh6FqcpscLxRJaIyZFLVCmRzIJ/E7C3oNBjVVRuV5jA+pep6G9nB26Hit7OCXat0FDuQBaZ3LbKb2Sn6n369neo7G1H34LCwLGDMujtUI+xe4MdCmGOdNGTEnaReDQ5/NuKk+IZEabNKqynPaNlvfPwvfobktkb992Lr/foz+66U6+763b96d5P6/X77tAb7rlbb7p7r962+y59arysIT5KgfBhhcxWc47ZavmMjDo/nTqtl7AHeAov4dl1U9vQHvBwZ3Wlqq5Zh0mHSSL7sPheB0+mlx1evx/eXuDbXgegXk9sg8VgRwVRmvIZ0DWNzFzjYshlRAqkCk2ShFmpYP5ujndD/o4o9lRBa1BRHse+RnVf4zhoUB9PvX1U9bPc2rTU4WHSoaF0eNl0ZAVJS8tJi0tJ/j6sZstTJLBkOIU5JNVc4wSQNc7AdKaxKtL2i/KF3RJ58UARtRuBe4D7eF9P2g/uM+l+xnRfHygoM/zdgsJfCliRankihLXmPXB+h84D59sDPJbne4hOf+eBk3ugYHss9AfSoFTdD6oIrOPSVAdpLOqh1Ag64j3YsJD8P+og7mvMSqAN7Ccf4cStxGgaCewW8zabYsorM5hK6Be2RUcaKPGOrCaJ1SSUmpVITD1F9RVJeDUyjoqEs274FzaKWVk5Izkoh0CZFaBBnT+q8EMMjGEKjCOOvGpUrfzVQ2G7zuzwbzIa27FVWWoJFUdM2fcRKkegzpjZ90ka4/vRBOpTyP45fnwz74zCMzy7d2Jn6Lgt2o3HdGPOvLNq43rA7OyC1PTMItFyTCCOrMjyn9KIUWQLIiZRk+DdI1kURNUArVk6jGGP1IiMkq8GPOnAhNeeZiYzy1W6ypEra13qqALZIOQ9kXlsVlSskgr+Je9M0grWxyyyq28zUjbsSfTxRDAN/6r+ehGL5KmIVaiROwsQqE/KjF2zzEkKJDmSJWU3378SX5LM3QOezJy3Ftxsx1pt07zE/C36TOAmQG4UK02Ngvp1qVnaZrChhzKrJDM1xxjBFJsy12lbpss0dWfngfPqgXBetXfKOw+c1AMeBKdAUiJTeHzOKAiepA3ShQjpq4o81q7W1i55ICXurt04zS3CJDC7HT6OUW+QsoKA9ASsskQySbLM82aqStTOiLoakNCXmGtiWegUdeikYcKTK4fpJEKPPt22oznrrXnPwIcG0uZqF+YYgI9uSlhg6uH9AgRnRkQdNUks9+VW+X2D3Z2dBy6GB8LFGLQbs/PAtAf8IWQRJBZAcsrrFsK6MrytkAihIAECaEk9gzjq7VRXTppVE1SjrbDkwf9EaKU86Une24Ep6OCNT242QrmyNa7UR3Q0cqItTZLP6VL2K5WBjmjy6a/Y6nWmK1/l+V/RaG3xeUSXx54kNfLUUwv0uEwL1zMNuqychoIClFFoE6tAScwl0kAe0xBdvm27rMR2bmKlaJSUj0KRe5IEM9e7S+eBi+UB/2m8WGN3425xDxACCYXEwYkfiJ05mDrfUdNaEzYr4NTFPCATWwmgkgdgM5OZedOa8GB+bIPrzqCbfxuxphIZIyHs40QyKcXcbYXmWnuJcjtEH7lA8jSLstOlok+r8jiKUcfwYpYPDNmiSSpuwjGiK1WzE49hZrIUeQeY5KM5VjqGKFnNO8nIdmdURCKPY8qHYQtWUEaOa3s2HwbaWkc7D5x/D3RJ7Pz7uBvhJB7w4Ojw4JeIoh4SfRXAHpZSL2mZJ9RXA2NoRWD15OEy0yq93qLle8B1rNQpoJ5QTKE9GSgRyCMBuWYFwis3JfbMshxUIFmhRJuEASCR4JruLAObAokgnBFanY2aKLluh0iPJrXJNFHONmVqrDQ9eQVF7InYFp3fAl4CqMhnmvBzhYvrbOFzadsTbfl0Bu/BtMKo0BbxUG5tLuiMjF43tZWr38OVSldYtwc6wbPzQDi77l3vLegBQti5mjWPH0G4jZCu2Dx4Orziw3hQ97JTxF02wncRj7cU82nmQrl43MVlj2V64M8gRKeilIUGEXsc3icZyQK1Cbhsq8MDuAfslGo3B7ZbBCGw+1Xrpo30cVef60RHM45L+ORbYFckueaVn7edHGZM4BgRs1WeWVNurlOCEwajMU/Tyr3BOZEsl0CmfPpwO6d6dsXOAxfMA/5TccEG6wbqPHCcB8w5gSAZfPGlviR/R5Nf0JAbPJ77lleO6dRpzqcXIwnIaWZMLp5wHF71wJq8MIEnohYTFmo9RAelEFRZYpUTm99bATMLrQAAEABJREFUY5stYlXMY4RG3G3NiFI2zOlYZoCNt9Om7SQ1faCzrfoYk7LPqbUluU0kHqfGStGMOfiqcQqClzHV33VMqkcRpi2fltCbG7xvLjQX32JlhLzt2HC6a+eBjeOByU/nxjFoU1jSGXluPNAG6Uxj1mlc/Q0TO4c5T/h7L1jHnWnC8Qd4GkUMsuQQFEiqSVCL5UD7B/PaM7dTt2/bpdvnr8j417nL9a9zu/Tp+YZ+cmaX/rW/Q3vLeR0KPcUc0BvbVldYJD0CfmsDQ0h5DtLpUfR6P+AJJuvDduWCJMqRcZaKvu6Z2a7b5y5bsf2OuSt0x/xlYCfYlbGbud01u1P7+/Masbp0WyxJjsKHoiyOBMPHizjbjAs8vwZo6/tsgzMd8KNQAG1Pwy5xTJopnbPTuj87dc58uSUU+XO7JSbaTXIDesCDaqokVj3Ea/nvf1HL8TMQZQtnYraL5UhM8KWaw6cHTzNTILZ6gPZvyRUkMO/Tq0v1KJdst3lbHfq6b7Cg//GBT+iVH7ldv3zrXfqV2+7Rr358n34D/Mqte/UfPnan/sNte/Xrn75fv/Xxe/WHH/q07qFP1e+pJMmEiGVuiIN1SzLCvfWwtQRtUjs9Kj/YihNgutT8xzEwVQduYZI125y7U6nfft9tekW2cY9efuvtesWtd+jXbr1bv/Kx3fBv16/fulv/8ZY9+rV/+bj++BN3aHFmRooRX0WVdcqr2x6+ygkssNpkTgn4f/MSSPIMLjZUVdDDsIdJOUtMVY1tWj2SkFKWVS6tNp2Dkp0DHZ2KLeSBsIXm2k11I3qAgLhiFk9jTYVYS+ykkssNpbhyTkc5D7Bxwsg0BfoqJ4IgKRHIl6tae8dRnxhFvX+Y9I4lcKTWOw5Vetdi1HuWpfeOg95H27uXg/5lOekTw1p3jSqNc4CPCkno5aLJwTgiiTYcH+nMYL7CIZm4Vp/LJE9TbfT5F04Okow/Vff0gVGh94yS/hm8d2h671B6F/Rdw6B3LZv+mbLLfIr3ZYdwYoVfIknGYSRCw2bzQaB5PlAGkrOcHgd0KE1x0Zfr8Ay9Oj+Hj3J+NHdaL0kP+E/KJTmxblKb1wPEyBwrj5qBM2EY1KNc8+CyouA9kCeaCoZ/u9D/VFWmCHkMLnsDFSD1ehoWQYdL05FeqcP9UovQRZmI/xqRkMhlGrIqHJL4KpJXYBXmAd7hCTKPzfiNcWinzDBYdTZnyAnXSCgO5eQQUGhKlIvejGLoyVepbtsy9g5DoSErwWXoUjmjQ2Ggg9bXAQdbj4vFQOPenFI5y3u+vmorFY2VY+pJqa8Qe+pVgBVrYA6RiVWM6H85pVbkHxX4GIBtytD0YZLL+QeOafY5Kpsf50hXp2YLeMB/WrbANLspbngPeNA8xsg4XSfQtkF1rYc2EVgdnsAqBPx/afZ6JCFFOtZmqoueYtkjjs+o15tXrz+rRCKLvUIR6uWqMHkCiyRHI+llHdN2UHZTWlA9q7PV41Q+2ATujojNI+wfxyT/c1tj/+ZkWSqVfZJUQVIuVPGuL5Lo6gwSFu0j7K7p539YucYXEd80RqLVGq8WFANFH9e/AOMJKSJbK+V/pLz8e3iw5Mj96ZMpl0Sqa0G1Oy9VD2yCea08n5vA1s7ES9AD5iGyDY4tlQiRksdzhVWmB1wPvh6THf7wFgRiF/GATDf6RLWB2xOZv/NJKHJE3g1FGo19tsBWXGLbMIYeK7GkJSWoVLECq2QakTiGdcQOH8Xh2kVLmkDn6PCZNDBWY3J/TBBJWonVVk1SqlhJVaHUCLBrKF+RLTP3mpWj//1D/7p/wlqRpIIq3FapTCM0jWQGxIShsrFkQ5nGKljfmfcBSRzuSINyOsmJbFKGHH26AGMdzexqnQcuvAdWfzov/NjdiJ0HJh7gMcwBfFKFJA+S0Pb0BOYsJAnMDdd5Hnd7rDpyciOg+6rDv7AQCbAemAtWVqEoZL4CK0pFkpRICMZ7IyrysvMiCSOSMPx3xpL/gV1HMCUGdWiNg6Y1uKfHcvsdSj6z1b7tmIGVlRVsA/pqEdtrMxJtIbfTen0p9GQkNqmUG+srKTNTj/kMmK8pojTS1CCS7R2e7GhQiHVecXmZzIY+lxdFA+IIGWnF61T9NL+AllLszs4DF8MD/oRejHG7Mc+bB867Ys8N52cQAvn0Azk9kFHxRHVUOwE0JMLrVFsgkckDt0V5oK4I0lWq5BjDH6MohqDoCQvU4vCMgTiRXsnLLUh2zna0LKQnJ4PKMameLTFGcWBjtn+iL1aVkv+Ff1aRYi4ZiTUXQ0fWUjEVqnjHlf/fsUiS5j1XHJsSq816JJKUeyygtVRNYhszpzHvyCpoIjGFFJRXsz5e8gvIdkAnp8uhSZ7VcJ9WDlspdYXOAxfNA/6EX7TBu4E3pQfaUHeOjPdH0HG0ujwIQTJTmloJWNQkTz41lZqGZvXVSMLKQTkH5pRYnyQVTZOaFRrdESLuq2KVJlYtIhmIxNaUaaefZApFofN9RLKCw8dJlBvq1yhPwmQjKBMwJur2uJ1UybbkuogfjHkBEnLJiqwH7bE6K5APeW70I1El6p7EIjTCr9DjddFmIM+UITV1+DDOcuAOWtDF1bzBQbk7Ow9cbA80T+XFtqIbf1N5wL8IcK4Mno6FhlIHRDmAs37Q1NEnQNfUXSYSVWu22vw/yRyykzbmSa5JPh5gyyj1EXTMkKB68B0as3XmnVOlZd4X1WS3Zi50TjTQrxkyyKinKkJTBsPmE7amkZlncWl0+VZfQksUg0nyMsBukXBywkpMKNIOz1kmk7wQx7KeKbBNWI+XNcvWYxxXEu/05EdLKftYkW7RgmoSoieyvC1JHRcqb2syhOFXt4MilgRAJx8roIRzQkRDA0mwz/hs7sEZd+86bnEPrDyPW9wP3fQ3ogeInYlIacZKAzpmO80fWMK5Fqkvs3WYSFKRbbEIFdTyu66CuF8Qx4OWCej+zT5vK2Qy35ajL6KqSWY+bXJZDuCWtEKdf2EQJ8M0NPlW3jEwJAybnXqicTu9bMxfPfJIXFY0th011mh4RIqVQp/k0ytU47BEkvIEn5IpsHwNrLxwTl7FLePbIc4oJFShFR8ktjArKCxF/jnFdZCAFRBOt2GlQr07Ow9cLA+EizVwN27ngWM94A+jg1C62pSSSl8ZwPEwzxpDvOohABcaLCyoV8xoEObUL+fVK7dR36ainFXszWo8mNNofpvq2RmNCdYFq49iVCtEI2yDEPJWoycGh4/b0iZpTCK5Vo9EgpnGasuZlcgrmoYnppMhkFQy8AsZWQpjBl5UtJEKElfJBEIvyFeny5RtMGClVtI2o14YaGA9zfLurJ9KWSg0mpnRIbPsUzI/uvyM2SaymlfA0X4wOMfdJ3jd2XngwnqgGc2fxabUXTsPXGgPeDQkKciRx/Y0lQtHXXy7qSDgiuVAJclRF0GfOXRQt4danyiljzv6QbcNKA8KfXwQAOW+dKuNdUfNamVmloTYy4krVrWif2ECfe1JzG+LF476quio0Y7+kXQXuX+c6zhK1CvOxBf+5Q//yyTjotTSoK/PWK075nv6dCl9kqT28Z7J8SneA34i4Bcme1uo9a/4fn+/5N1hT4UGKopCCggYfnZH6/h7cnRK07k+GPlcq+z0Xcoe4Gm9lKfXzW3De+CYkHVMVWKVULG95a+DAsHVVy0qTQfqsd70wffo5972l/rxd75ZP/auvwJv0k/8819lvOhdb9ZPvfNv9KJ3/I1+6e1v0v9477t028H7tUhMLqyPiqB+0ZOU5F+smIbzaFAeywsZdFSUb6NNIzedxcXoaySyBlTy6T+WDZKCHBF+g4AVwDvSpiOsS4tZqTcvDbZpGbx/7z79p7e9RT/91r/Rz/zj3+kl//QW/eS73qIXvhvqeO/f68fe/1b9NOVf//u/1N/e+gHtE1uRaK59u9WdzXiezwqn8H37EUOoBdCdnQc2jge6J3Lj3IvNYkkOn2do7NrdskYP0cc3m0dS2EUolMxDKisEGSFX+telI7ol1foQ7R8EHwAfZJ32YeD1Dybpo/BuBZ/kXdEiKxQVfSX6VwTqindKzTsj0hY2eNKaBt3O/3nUgP7j6Dh+2Gmxtpyl2CLsA3dIPY6qQ1+HSM631SN9AoEPk4A+gD/ej8AHoR9l9h8DHwYfo/2jqnUXtNIMnFLBGB9f4CLVtURNjdcRSoDT71SkJQGq5/q0c62w03dpe8Cf0Ut7ht3sNrYHThGyfCvRV2Bim6wm6XhwrQjMkSc3MbPxBCNoZQWhuq+RBlqmPERmyPai0yVCcSwHGkXRmwb0Rd61RcaPbKlNv+eaLrt0AwbgnF6FeRnWmZ9kI1tZhQVWeRgDTzk5BPQGJcpHw+ABVqgIqCDTlKOx/NuX/aJQ4F1ZCkGHmdP9CBwER9AxDqXGoUca65G2StUkuuWy0MFSupeJLKKVnCUfvigCvbDCRM8GcmdnrnJxqjrhnjNi50xTp2hLeKB5WrfEVLtJbkgP5GgYV0zL1bbmFX93xappNOadFtR6PQWC8ZAuQ+QqkpNDoVCyQIAOqsh0XhZ1uQ7kY9mXyl6TwJBFhGhcKVNtsMMzyVomteF9QvPUgjQe4ht/v0eSHy8vaRyZl/8tRZZQKSAMbeaZ8E0i0Us1vhTeSAXtbM+Kd2Zk0TxqXeFclBtNkOxCisqFLHFeL4EjD3fORukUXdIe4Efgkp5fN7lz74FzF2ByhGwCpptJqQmwuUIjqwoRaB2ppaw64nica74Kq0hbEYhtRcWaOFtleFkeqInnigmeNKzGKsugesy6jYCfv42X3wExpcSPArBjIMGfgifHabipZwxWQNOrvkQ9JxKnE6UGbSFcYn5xvzhoq0KQryhTEZhOraKMKqyWKuxOPSQ4fa6s2Nwn7uM6ew8Zn7v//oF/nz77ZKTkCTDRB0HvUlGskE/A70MDmCt1L589zEy+6jazYjwe+5TPXmmnYUt4gCd9S8yzm+RG9YAHTAf2OWlBVR6vM52+TAQmRHnR4iHPGSuBlQjc9nG+A5kIGnlvd2YUrKPQdrtg1BNWi1MM6ra6iFOHl30+NT/FThNbiDLSjtNU4j9fgmkyP59rlM/aofaIFDLDCy3gTU5SnX9EoHZ8G8zzcRYh+PLxfKjudF6KHuDx34jT6mzaiB6YBJc2fm5EEzubOg90HthiHuiS2Ba74d10Ow9scA/kdeEGt7EzbwN5oEtiG+hmbBJTLtmV2Cbx/6VuZvd8Xep3+BzPr0ti59ihnbrOA50HOg90HrhwHuiS2IXzdTdS54HOA6f2wBZbiZ3aIZ3EyT3QJbGT+6dr7TzQeaDzQOeBDeyBLolt4JvTmXbuPWDWfdA/917tNHYeuHge6JLY6fu+69F5oPPA+fNA9+3E8+fbS1Jzl8QuydvaTarzQOeBzgNbwwNdEtsa97mb5Wb3QGd/54HOA2t6oEtia7qlY3Ye6DxwkfF5s54AABAASURBVDzQvbS8SI7frMN2SWyz3rmLZ3cXZC6e77uROw9cSA9sirG6JLYpblNnZOeBLeMBm/yNzi0z4W6iZ+eBLomdnf+2Yu/N8+2xzWPpVnyOTjTnbqV/Is90/DU90CWxNd2yeZnn0/LRaJTVF0UhsybWeNmZTvkE7cXj2jLzAl8a6yaDBh7zlLJd+X89iUmFhfxfd00kOnIRPeDPjcNN8P9TzGmHzgPr9UBYr2An13mg3+9nJ1RVlf8DQ6/Udd0kB5Ja9P+EEmZZllwlb8uF7rJlPdDr9dQmqGOd4Hx/Vvy58WfFPwghU1NP0O7sPLAuD3RJbF1u6oTcA5OVWPJgY2byAOV8D0ae2NoyQSgnNpdzXodL3QMnnt94PJY/D62EPzP+vHjd+f7cmB21bu6SmDunw7o90CWxdbuqExwMBvc/7GEP+z+f8zmf8+aHPOQhf/fgBz/4rQ996EPffvPNN7/jpptu+ucbb7zx3dddd90HLr/88g/ccMMNH1pYWNjXeW1re8BXWrt27bqf5+E26C08Gx+5/vrr/4Vn592f/dmf/Y4HPehB//dzP/dz3/oFX/AFf/OFX/iFb3j4wx/+ZpLb4a3ttW72p+OBLomdjre2uOzTn/70Oz/0oQ9964c//OEn33LLLU987Wtf+zWvfOUrn/Lyl7/86T//8z//zJe+9KVf/4IXvOAbnve85/275z73uf/uUY961B/ism5rCCds1dNXWiSoP/mO7/iOb+WZ+GaejW960Yte9OwXv/jFz+SZedprXvOar/nVX/3VJ33gAx944nvf+96nffCDH/z3T37yk/dsVX91816/B1rJLom1nujoujxgZtEFnT7mMY9ZespTnnLw2c9+9r5v+7Zv2/M93/M9//qjP/qjt77kJS/56E/+5E9+mPb3IluD7tyiHmD7MD3+8Y9/9y/+4i++i6T1PpLXh37wB3/wk9/93d+9+xu/8Rvv+8qv/MrDPEPDLeqebtrnwANdEjsHTuxUrO0BXtY3X2dcu7njbgEP+Dux2dnZI1tgqt0UL5IHuiR2kRy/FYYlePmqrViZa1fYch5gxe7fZLUtN/FuwhfMA10Su2Cu3noDsRLzJLbuiXvAc3gHp/4tNqden8ZavOn248r+1X8zD6YZZnbUN+aOk9+CDLPVPGN2dNlstX4mrimK4rSegzMZo+uzdT3QJbGte+8vxMxPGbwIcPnr+G6M/6Kroy1HTz5UzI4Ooq0MTd15DjxgZjm5T6sys3xf3NeO6TYvm9kJf/9LU8ekbzXFutDFbrxL3ANdErvEb/DFnB4B7JRf6mC1dlQA9dWXJzb/arZTdOR2syaomq1Sl72Y87sUxnYfux8da83H2/1eOLzcyvh9aT9ktLy1qPdB93itto7XeeBceKBLYufCi52ONT0wMzPjX693rNm+FtMDoyc2/2q201bGg6aXnbZwWed1OHMPuI8d075s/evU2/xeOLx8uiPRJw2Hw1N+mDldvZ1854HWAxsyibXGdXRze2BxcbFkBgZOevJJXf5J36mZ5W0sM8t9zCxvW023qTvOiwfMbMXX7u8WmjrMLMuYNfdHJzjMLN9Hv6+zs7MnkOrYnQfO3gNdEjt7H3YaTuABM1s4QdNRbP/EPw1vpK+TvJXoq4QWLucN3u5B1ssdztwDvt3nvnQN7tvWzy31Noe3O1oZp15fC9PyrOCMldjcWnIdr/PAufBAl8TOhRcvER0EpvCWt7yl/NCHPtSHzrz5zW+ef+Mb37j9j/7oj3aBa17zmtfc+Lu/+7sPevWrX/3QV73qVZ//n/7Tf/riV77ylY94xSte8dif/dmf/aqf+qmf+poXv/jFT6f8pF/5lV/5N29/+9ufgmsMnPD0RORBj22nnLBc0OvY4kV5kG1lnPone+d5uwfaLHROLltTybTf3b/uW/e/w8ve7p7xutNpuPx03cvHyrnMW9/61q/mmfjKH/uxH3vq933f9/lfdXnmC1/4wifzrDzh5S9/uT8/X/Trv/7rD+NZ+uzf/u3fvpln66Y/+IM/uP6//tf/ehXP3a7JM7jt9a9//Zw/l+9+97t73P+TPlduS4et4YEuiV1i95kf/sd9wzd8w28++9nP/oNv/uZv/sNv+qZv+u9f//Vf/z+o/69nPetZf/zMZz7zdc94xjP+9JnQ/z97XwImSVWle25k1tIbi4CKzMNxwWd3gwI2As0i4sMZXD4FN4QRdT5eA755MmoziKOC7DDsNM1m0/tCbyDS3dAbCAqDvIeDvpFlQAFZpNl6qa7KNe77/xsRWVlZmZVLLZFZdbLjz3Pvudu5f0SeE/dGZxbyd37+85+/+3Of+9zav//7v9/wd3/3dxsuueSSjWedddb9cDoPXnzxxb++7LLLHoFzeQxB6f/ccMMNj8HJPAo8Mnv27F/fcsstv7r55pvvR1DbtGTJkntXrlx5N+TqOXPm3DNr1qx7H3300a9Uo5eBiGA9OrxJkybJu971rvTf/M3f9Oyzzz7Zd7/73fm9997bf8973uOAMn/33XfPY4uqrmdt7F9RngHyPn78+Pw73vGOHvCbAtdZIAfeszgPGaAb6W3gvaetra3QSXTeCooyCQabBx544Bu4Hu5DULrrzjvvXIrrZOXChQt/uWjRog24jn4F/BrX1MOQj+DG6GHiqquu+g0C20MIcpsR7DbzujzvvPM2IvhtPuOMMx449NBDf3XIIYfcP3369E1HHXXUfZ/4xCfWAmuAtcccc8zaY4899pfHHXfc3biu70L+Llzzq3F9z0efnyhjpqpamAENYi188sqZ/vLLL09fsWLFmXAWpy5duvQf7rjjjpPhNL6+evXqr911111f+sUvfvHFu++++wuUd9111xdxd/v5e+655/h77733f6xfv/7YDRs2fGLTpk3T4XgOefDBBw8Epjz88MPvf+yxx/b53e9+967/+I//2OuJJ554xx/+8Idd//M//3PSU089NeHZZ5/tePrpp5PPPPNM8s9//nPyxRdfTL7wwgttW7durev64p966e7u3jl58uQ7//Zv//Ya4Mb3vve9t77vfe+77f3vf/+cfffd93ak50ybNm0e6j6NlYIvDGVEOTKKdZ4Rk/DEGhEfcGmpy7zi3ponbYPJI1j0tclgktSgHAdTZeF5Hr8zZ3Hz8P8OPPDAG8HxbASt2z70oQ/dhsB1K/KzcDNxDc7JJZBrsTLLgHvXF9u6RNEb7ShFJpPxXn/99bYtW7Ykib/85S/Jv/71r7xG2pEe9/zzz0947rnndsH1szuuo72efPLJvX//+9+/F9fah3DNfRT4GNKHPv7444djFUZM/+1vf3sUrsljcG0e+9BDD30aq73jgc8Ax+PaPX7z5s2fw7X8eVzXX0D+C7jmT8DOwsk7d+78eJG5mhwFDIyCT/EoOAtDOAU4EHovYgh7Hd6uIqeIUSyc55PYnrwWwffiVatW/RiB9l8QgGcCP8Aq8wcIvjOx3TTzs5/97EbMter30NBn+YPRrHzJmNJyNWWM8Y8++uiHwfmFa9as+dmSJUt+hBufH2Ib71zwfx4CwGWLFy++cfHixUs7Ojre5pYuSWJbyvoQa236OyJWI3TwoWVAT+jQ8qm9NcBA5Awhzfbt2zvf+c535rGd1Y2txJ1IdxF77bXXjv3222/7HnvssR2rsa1wvF2oHyxDGhhTmwQMgEf3LBKBqYfcEh/4wAe2UZJzck/wXDCP+nnUdX9LzsMqLuhF35WB+BjQIBYf9zpyyEAuF/ygA5+3IIjtgS2fPcKiioIBrLOzs2K5FtTGQD2BaNu2bQYrMYPtQeEP+yKg1TZIE9WqZ75NZLaaMgADtQSxAZprUbMxAMfC1QnRbKaVtYd39SxgAMPzFgEM0lWvy3Q6nUilUi21bcp5NhvAN02yvClgYiBMnDjR6+rq8nB+3HfABqrbpGXYgR7oCWGTWq1mDchAVWcxYGstVAYGyUC0CoN3cV94xvMxD4GtanBCnQQwyNG1eT0MIOAZnCeTSCTcF56Rr6e51lUGhoUBb1h61U6VgRoZ4F09q0bBDCss6e7uFqFyANCRRm0GqKZFNTDALTbcPFStyaDFLdyenh6umN13+Ko2apIK2KFoEkvUjKFmQIPYUDOq/dXFAJ+tMCCxER0NHer48eOrrsSw/cUmikEyQO7BpXvOVUtXvHGIVsAMarW00TrKwHAyoEFsONmNoW9s97TM87CInsgZwnaqTJRnphIY7FBWNdhJVKPkUUg4Frpo8cMEEzQmkIXZlMy3oC9JRFyDz5IOSiqGWdRzKWNqqu7qxv1mTO+fmjHGDPT5iNtUHb8BBjSINUCaNmkKBlrHizYFXWqEMjA6GdAgNjrPa6vPSgPUCJ9BrEyV8xHmXIcbGgZaPogNDQ3aizKgDCgDykArMqBBrBXPmtqsDAwxA7oSG2JCtbsRY0CD2IhRrQONHgbG7Ex0y3HMnvrmnbgGseY9N2rZAAwYvAYo1iJlQBkYIwxoEBsjJ7rFpln1v0Hr9pcUvj0gePX7j+Mm/IH/fkyGerTRo7UYUGvLM6BBrDwvqh0hBvhlWw7FhRUR5akbCKhrgYGqjLmyPoHMBa8gYPXRR6ywnIjyNUrfD/rETURL/WJHOL0GZhy2VNG0DGgQa9pTMzYMK/qyrfAnp3K5nI10AzFAZ0pHOlCdsVLm1e2ag0BEfngjwBsHyKq98NzwZ8Ii3ms5TxyjmVDLPJvJXrWlOgMaxKpz1HgNbVkzA3SIEydO5N+pSsDRJKo1ZBBDvWrVtLwKAwxI5BKyahDjn2HJZrOGPzvFX+4gqnSvxcrAsDOgQWzYKdYBqjFAp8g6XV1dkslkbHt7e1WHCgear8Xxsl9FZQbAo/ujmOCyqi/ASgzxzifvrbiVWJkELWlpBqpeuC09OzW+6RngagrOURC4BB5S9tprry441h3VDJ8wYULvnli1ymOrvK7Zkn80sOAzAznggfOT3XfffXG6coIVmftzLAM20EJlYAQY0CA2AiTHMETVlUwMNpUdMnSiXIHJpEmTZJ999nl+zz33/LMM8Pr973+/+1tvvdWJKhrIQMJgDm7jor194403dn388cff+8QTT0yotCrDDcYbeH72Buq7AzcbTuqbMhAnAxrE4mR/GMZGUGiZAMbp4+5esApgUrZu3SqvvPLKnuvXr9/LKcI3OFVz/vnn73nmmWd+5JRTTvnUT3/607MeffTRE1HcBugxCAbCQJT87W9/+2nw+v0LLrjghNNOO+3Ic845Z9/ly5f3eTb5y1/+8sPPPPPMf2fgGz9+vLvxGMTQsTTFtdRSn49YSGpk0BjbaBCLkXwdOmBg586dwj+2CAcjL7300uQTTjhhjTHmRZS+gjv/15DegiD2X7fccsuvly1b9gs403MR7PZBmf6CBEgazEHO29razJYtW967Zs2aM1evXn3rnDlz1l5++eVPnHTSSa/heeVr6P9V4OVTTz1WqS/hAAAQAElEQVT1ZnDeya3E7u5uqPRQBuJnQINY/OdALQADqVQK78K/GJzA6uydcK7/DYq9cdf/Tsg9gd2gn4T8BKAd+Zr+7hjq6TEAA+DZPd+C9IA2YByqTwDI9x54AEb+3438e4BdkTeog2RrHrgh0huf1jx1Fa3WIFaRmtFeoPNTBpQBZaD1GdAg1vrnUGegDCgDysCYZUCD2Jg99TpxZWDkGdARlYGhZkCD2FAzqv0pA8pA0zKA53n6TKxpz05jhmkQa4w3baUMKAPKgDLQBAxUD2JNYKSaoAwoA8qAMqAMlGNAg1g5VlQ3Chjwi/7eFnaQrJH+f5LEDN88MZ7rvFQ65RC+WU98Kf4YIw1duRFsOeXY0g3jCR9bRDbTbHHFN5M5aosy4Bio/Y1uKULozPu4dR9d0akTeREPkcz96RLfIKjh8o+CDKoN6mA/gCnAQ//BGIEuyAvKHQY1WHFjg0wAazwRzlMgC4AKxX0CGPIuwlOitR7KQCszwKu9le1X28cyA3TCEarwYJwXdxENNV0GEocroB5prGn4LjXLoPbg34dwfMO+iMFbpT0oA63AgAaxVjhLamNlBqJ4VFiB9Iag4kY2cu6UgPWwLDMAApYhrI/FCVCPRN3CGAyGgC3Ax4LLAn0llmfiIMHLoI9Gx3cz5RwIsei2135XhnlxFJiEuTEVwnEVplX0MqCplmRAg1hLnjY12jFg3bvAf4cJinKXtI8CKz6ClwjTOeQZXJhGMnLq9Uo0LX+gX0YOjtVHlq8t9Y4b1Ud3DIIeAqEnmBPnRzhCYAPLgegIFq0hP+SOiApVKgMtykB4Rbeo9Wq2MlBgoO+lHLjwQqEUL0V8582jGmzHH2tvFNLnZRFEBkKfyshYSSDkNAZxz73QCcZkcDaWUcmHIjqYD2pxlhEMigmIMXfobyeOvlPO67qFZ6WmKwPFDESuObis+X8oXPDif3hANeYJJHsPKCyDAVY39Ut0g/Z4L3P4oa5UhmqKQlva2wjYyUCI+Ciu43O2TlGu1BXomzLQQgzwk9NC5qqpykAlBhgsbP9CBKdgu44uG5c78pZu3CZR1xPGkYFWTgOVoYPgYCdBKnzHOGGqV5TowjYUA40xYBk6Z/tgfpyLEc7NGszVBW7oUMcH9FAGRisDJZ+s0TpNndeYZKAQ03iZlwKO3i3TWMmKNbVLkaB+0Cbs17I/sIwgiXcc1EMwYDowHcLVjcqpC8Zmv/WBbT3xEbB8QVB2Y4eSaZoEsHcGMoItfIlSzCmUgdZmoPiT1NozUetbloG2tjZnezIJB4yU5/VellE6KkNx4UgmUQ9OOlDQMRNBjo7bpQyfdaESVl6eaRMDZ29sArGCY0HyeZKXE2kEbIuA4OKfGyx8YwAhGLwoCTz7EkgLEy2eXZmCgVXGNlmRSpC8YHjAiGBm4iWQRVDDHMVxCH5oA4o5HMEARmmpA9yijW8iaOJJR0cHUsERcR/kRIrPQWlZVEelMjDSDHgjPaCOpwwUM0BnyL8UbIwR34eHRyGlMcY5VaYFr1wOzh6SRyKB4INELhfUp/9Gtv9hqHJvTMDZW2HwcF92DjS97zZM1imNWDHo0DMGZnhCGfaE8QySBAQCl7BOCEEAZFvqUCroxol+0uAjyoBUSQr6ZxlaW/c/VpDgwfEEbVHMKg7QW6D4YDUGVerIdTqdZlLIMfU8P0xT5vMImig1hp0ioccIMqBDVWIAV3mlItUrAyPHAB1l8Wh0oHSq1EUrADpS5gnWp293Tr/UM7NCAWEhBGKNGJuHP7eSsL54eSuSx0cgn4AeKzM/WZDiJ1CWKOQNVnJSVM68wcqKw1j05aIQIySWOAYQjOIQpqkzPjUWJVY8Rg/Bi4EH40s4Xqk0ob6sZFvxEary6MiiX1/ERECgMVb6vKBCJSlGFI/a29uF/BISvixs5Dlg8KJknkWUzBvDDqlRKAPxMYBPcHyD68jKAB0iWeBKy5jAKdKhMkgZE+TpMFknAp0qES7cIjVkyeVMH46ghWgkiFgiJi/G88XYHPx41jl/zwikgU4QWFAFbRjsPNQgGAeYLyedTnJoj/44jo9nZQgq4l6eiEkARgQ1OE+LMidR10oWY9IGg9LKEPRpgPIyDysxNvryYIfBlqjHuWGebs4YT1yAlYovY4KiTCYjxTyTX5bwPFAaY9x2YnGQMyZszAoKZSAmBvBJi2nk0T+szrBGBiLHGDlROlQ6UeqJSE8ZPT/r0zUCjyAUFOsMM3zjygQOPmFy4jlkJJnISgLwPKTxXKkN9cohKRZPl/qjt66PPhEUERgFYwj657AF0MkTBYWI8fKSQJBJIDJ6sC2Jtny0V4wEomOEYn3/NMZHAEtICn1msLrEfGBDAjqhPZgbopxgGkXAR95KIc8bAXJsDEiAOgpaSIKjhDDoRmmeE54D5oniNPMKZSAOBnBFxzGsjqkMBAzQSdIZGmOcw6QTBehmofb9MB1Uxjufn0G4g87XOeggh/fAESPhDsQCJwVBgysf36bE+j3QpbAKSolne4BuMf5OB892l81H+lIpCB5i0wgIWcQKBCcY4wGCgY31oec0MBxXRNCxLIFyrgYFwUZMBlVpC2zA2AYQ2gLJNOFJj1SE6cG43Rggg7F6sJLqFj/POTKfg542QBQdAUMexoUyNI888jxAI+TXGBgr6ApRCychD30O5RkgjfOR6ujoYOeCeijSQxmIlwEv3uF1dGUgYADO0W1XTZgw4fVvfetbl3zzm9887Ytf/OIZn/70p8867rjjzjv22GN/ftRRR236yEc+8uJBBx2U6ezshNOGk3ZemZexSwSdMWgwBZUB4I/hkVOSyXRJOrVDelLbJZ3eJqnU25JKvy6pzKuSzv7VyXJplkXI5F5zdZnPpt+QTHqHZDPdkvezCE+0x4dzD6ODn0dQRB5ZBjDByksQH6yfc22ysCWTYR+vop8A2cxfC+lMOtBVlKnXJZfeKtnUNsl0U+6QTGaH5LPdIjaLsXNkgUMKaSAipiJpjBFu5YLPng9+8INPAEsOPvjgy44++ujvgPdvf+Yzn/nGiSee+A9f+tKXvsHX6aef/o2PfexjP0bHGQY/SD2UgVgZ4LUcqwE6+NhmIHKEuOkXPgvbY489ui666KIN8/BavXr1zxHMZl+K109+8pPvnXvuud/67ne/e/IZZ5zx3alTpz5qDKNCxB8iRZQsku4/f9B7+xmxcPC51Ftie4DuN0V63hBJAZB25+tiu4FQSneoh7Qs73lTbOpN8ZH3kfeR9xEABW2kZ5v4mR7xcwwcgqCBjxWClSCsYfUiwctDUEEoy/uSy6TR1w6M/6a4cdGfRb9uHIzv7EKe0pVjjEpSet6G3ZgP5uUDufR2sfkeDJ0TE5kRGFD2PeQ/e8ABB2wAr+f+8z//84/OOeecC3HTcNuGDRsWrl27dinOwx3L8Vq4cOGK2bNnr0RgW4bO0saQWKT0UAZiZACXeYyj69BjngEfD2W4CqOzxypMdtttt9fx3GuLMcYSX/3qV/PTpk3LfvKTn+yC83zptNNO+w1WA7dgNbAE5T2IE+DQD5FH1gfgw6GxiGv5HBIsdtt7GeF2nfjbROx2oAuAw+e2YCVgy1EIH6ubIhim8zvROfpAfwkEyTZEDYvNN9+3zgbsA0LCHv7vEdsmxm8T/munYX4KY6M9tg5d/xyjEdAOH/1ICB/2WMwTq1HOHRTABgwFS5n2obeAowQ63jyA/57p06ffM3PmzHX/9E//9AI47zn//PNZBTXKHq6MbcuWqnKsMRDrfDWIxUq/Dh4xwBUBA1lPT88uqVRq10hfSSKABZ66UIF+NUJBWZRgGSNaFrpeGMmK4f/ok1xdUrhdh7aC51IiaWzX5dGeY6B7HlwkuudekQ4fNQu4Mov6WaQCROMLtiQFdgjsqUvSjj7Ioe/yhw3VkWQWQcxiFZxmuhYkk0kuwcLJ1NKieergGiueevMYppY0zEBLXogNz1YbNiUDcCyCoCRYgQmCWQ5BjN59QFvhSHvQJooQA9YdqJBj14uoP59rHAOf6OXEImBZSIEUD2Z50LtAhjT/Ywn0LPeR9pkGhOVRZzFKBLEcghiWp3UZwUBWVwOtrAwMBwMaxIaD1Rbos1lMRNBy/0HDx7ZiR0eH7LLLLlnIqkEMAc9HEEOkkBF/MeiVDmoRkHwEtMAgBC5s2bk60FNG5UHgQjk/eajvyrC9WK5Plo0EcA7y4JP7kfUMF0y1nhZaVxkYBgb4URqGbrVLZaA2BiLnTYnVgEyaNCmHVVa+Wms43Rycb2yOlPYGNnJB4olvej9K1qWR5/YhEVTEai18NsUm1BkmYpsCLXAAjz64r3k7MZfL0WhEYtdc35SBWBnAJy3W8XVwZcAxYIxx/ztx/PjxWThJPu9y+kpvcLopbIPF5kiNYQCCdQxYBJIigc4tsFzwSiBqeSL8Hx54d3rI4IDe1Qlycb0bY8QY43d2dtYcxEJbGcjCZK1C6ykDQ88APklD36n2qAzUwwBWAkJgdcWVWBYrsarbiQxiaBNbEHPzYxCyDFREEo/CPPEMggL0HiAhPN8EZXD7RvjCx47tJIkM0niP8wDvWfBZ73ZinCbr2MpAgYH4P0EFUzQxFAxgmyvwk0PR2Qj0AXuF4H/XRlCScePGZelUaxiaX7ZFWKih5iCqGNOfTmOKdAhQDFae9cVIXhK+lYTNAb541AEJ6gEPesJAJxZGRUAyzgMr2gxWwPyuQT1mFJFQTzOtqwwMLQPVgtjQjqa9KQMDMIAtLYEzzWSz2arbiR0dHdz+8gfobkiKGGBLO6KOQPQVcQHJF2PTCFppaePvMYY/J9UGmbRZMX5GkiYlSS+FOhkHQVATP1/a9YjnOQ8GMd481Do46rqqbOsS+qYMxMiABrEYyR/GoVvyLhnO1GIVlkIwy1bjBluOadT3q9Ub9nLHNMz105LP75B8bofY7HaRzFbxIf3cVsln3w5+Hgq6bHab5PPYubMZmJYD4p8CVsA0pOaIms1mOWsC9rfWYfBqLYvV2moMaBCrxpCWjwgD9C14LuNjJfZ2T08PPfyA42IllkIgizkCYHistAQBzCKA5TJvSya1BXgNeF2yPVskn35D8tBl01uEv7WYTb/pgpv7lQ6uxgR9DDjT4S0k7whiWfBecxALLVLfERKhIl4G9EKMl38dvYgBrMLyEyZMeGvvvffmyqCopH8SjrcHiDcCFMzysTOYQnDqklx2G+Q2kRxWY9mtkGHa5beLze0Um0+J+IjT4XfICt3EkOCWIAJZTz7PH6mqy4CWXInVNUOt3BIMaBBridM0uo2kIyUQxHJYEWzBbKuuCvBchj9AW7Ue+hrWw4Mrj2D5w4ncJjRpjElkRZgXpgnkBcHL1UMV/scOiLgP3Ax01bKFW2LnaPMdJdPTbKswoBdiq5yp+uxsEvdYn9EMYghOL2FlUDU4sS56r7piQ51hPWwR04hnwVhOx0UizSN8CFZzjgAAEABJREFUMcYCkFKoFdRtgncGsd12240RtiZrsI3LSRA11ddKysBwMqBBbDjZ1b5rZgCBi192TmM78eVaGvE/daANljW11B6uOvz4JMVagmlxIarXu1NHSPgyqMtSfj+sDTqiuByqET7AIf+Cc/fhhx/OpeIIj67DKQODZyDeT9Ag7dfmFRmgp6xY2IwFdKa4w38VwYnbiVVNRF0fbWpePVTtcBAVDEKXZ/hRIkSYNiZR1KOH4GUdipRNkQSHAs65NevXaZCps75WVwaGhYHgUzcsXWuncTCQy3H7SgRbREIHFYcN9YwZ2Rj+APAz2NbaUWP7PJ6jVd12rLGvBqv5YsXHv7zkbc6lLXrKWx8BKw/+mWNsIFDgDqaJPHIE00jGdJD39vb24KKJyYbhHJbXF66TaAhkjYkyKkcHAxrERsd5LMwCz4oM4H4Znh9eYwyc6fChMHCDCdqIlYD7MyyQf4Tt22vpauLEifyh4BhWYqXWMQgRvXpjAr6pMSZIG1MsLc5JhGL90Kdpw0AA3yyuO4iF7di2qcHrC0FasHJ3N3bRTV5TG63G1cWABrG66Gr+yvl83vDLqPzwcjVGOZwYCkZgs8Bm/lrH88ccc0x3LX2iTQ5Brymf4wwn3/X2XY1L8o7rhEvCalUL5alUyp2vgqLJE5wjgxdXnQi+psnNVfPqZECDWJ2ENXt1OCQ+43Bm0uEZY3DXP3zgeIMBDR03bhwF8aoxtX15qqenJwenlEJ9tusH6kcCxQOXG6+4PI50OZuKdbQJ56+uINbZ2clmbmWDtk0tOVd+DmgwbWUwY7rVoPZWZkCDWGVuWrIEH1iLVYql8Ujj2YwdViCQuK3LRiXthL1OwOG8ykQt+MpXvuJ+eZ1zLFef+pFA8djlxisujyNdzqZiHW2Cc++7H0plDeA2XaPnfaTaYbXuZsLtRI6JubvPhlPq26hgQIPYqDiNvZPo7u7mcyL+ra0snFMegaEUOehKkYWuGKXlA+VL+4/ypW0ifSRdeUdHRz6TyeThZLrhFHf2zqR6Kp1Ovwm7MwBXEnyuQzBNp8z/vUhJp6UQqcQBearrqwpYzVictxy2Fd05BP9NK2Err4ksghc/D924ZlLVryyt0UoMaBAbrrMVU79f/vKX71u8ePHpCxYsmDF37twZS5Ys6QOUzSjFokWLZkRA2elAvzqluiVLlpxOLFu2bEYFnL506dIZBMpPB0rrUefshK2n33jjjf/7d7/73YlHH330+YcffvgFhxxyyIWUhx566M+mTZt2HtI/Peyww358wAEH/Pi4444741Of+tQXITedccYZM4kzzzzzbMgfAj86/fTTf/yd73znp0ifRyB/PuTPgAtQ70IC6YsioPxiAvlLSkF9MVBeaMc0xrkoAvOlfVNXK6JxZsyYcckMAO0urQdsQ7AftHN20h4C+QuKQC6IC/7xH//x4okTJ+6YPn36OUccccRPDzrooEuPOuqoSw488MCLwffFxx577EWQFyF/0cEHH3wR6vzs4Ycf/vJFF1101urVq9355TkmcI7dOWW6UUR9FMtG+2I79DNj+fLlM1auXDljzpw5p3/hC1+4N6aPpg47TAxoEBsmYuPqFo7mj6eccspiYN43v/nN27/+9a/3wcknnzy3FKwbobSsUj7q92tf+9rtlXDSSSfNJSqVR/pTTz11Dhzv/PHjx5/y4IMP/vCRRx4557HHHvuXf//3fz/n0Ucf/eETTzxxLnQ/Qv5f//CHP/zr5s2brwCu/OxnP/v47OB1A8QNN91003XA1TfffPOVCIpXQHcF8pcjfxnkpcAl0F38/e9//5If/OAHF0eYOXPmRTMB5C8sBfXFQHmhHdMY52Lie9/7ntOX9s06tSIa5+yzz76QQLsLiHPOOefCYlBXDmxDsB+UF+zhnDn3IpAL4pJzzz33YpzjTQhMPyHHuJH4AdIzwfnZ4HsmeD4b5+Js5onf/OY3P9y6devJxx9//PwTTzzRnV+eYyI6n0w3iqiPYtloX1G7r371q/NOOOGEed/+9reX4OboadHXqGJAg9ioOp0tP5mEMaYD26DtkO3YAnISW0IdmFkHdJ0o64R+ErYe34MtLf6nlWh7kjLa1oq2RrnV2A/77bdfeqgAm/hF4SHrr5xd73vf+1LFKFcn1JW1Azb24yDSsd3ee++d7uzs7ACv5L4Nzyj5UyKE4x95dy7wTKkd56Ed52OXqVOnctsaWT2UgXgZ0CAWL/86el8Gin/mwpXAsToZvTEfIoHnaHr9RsQMQiKgmZDTAXthHVbAjYRFGz5jY1ahDMTKgDqBWOnXwUsYKDjTyGGyPEpTEtQRWBEYSsXgGACnPByXSNTSmQawWlgaK3VinqcGsZhPgA7fn4FSR4q7/kKlkrRzvIVCTTTEALYJKwal0nPBAYrPAfMKZSBOBjSIxcm+jl3KQL+gVOwwi9NsCOer1y+JGAKUBqvSfPEQOA/9zlNxuaaVgZFkQJ3ASLLdNGM1pyFwjn0MK833KUQGjrbfMzSo9aiTgUQi4VXjurjLeuoWt9O0MjAcDGgQGw5Wtc9hYQBBy/36CDtnGlKDGEgY7FFtRcugRRSNU3H7saiOJpWBEWFAg9iI0KyD1MJAsaNkmmCwIorbW2sQzIxFuW5rFRPTYNrz+O2F6H6genwC7/wllLpH0wbKwHAwoEFsOFjVPhtiwPN4OQYw8KXW9yWRCOKUgUgk6GiD8omTdkuef+EVZ8/84b+ecMGlVx5y1fXXH3TZ1VcfcMmVV374iiuu2+/Sq6/+YIQrrrtuv0uumvWhy6+99r9ffs01k6+88vopqDv13667bv9/u/baj1x2/fUfJa645poDr7hm1sGQB1963XUfu/yGq6ddfvUN0yJJHXHFrGtQZ9bBl2JMjov6B0J+lAjTByF90DWzZh1ciutmz/4YcfXNN08jrr3xxkOuvv76j191/ezDrppdGdfOuuXQa2fNOvTqm276OHHtjbceQlx9w83T2N81s245+PqbbjooAnUsZ7vr0e91N946/dobbzny2ltuOfKGm35+xKyb5xw++7a5h10/e+FR8xevPNW3xhNwbHHmPEgcTAnPiZXgH8uhxA2EZTUmFcpA7Ax4sVugBigDAzDg+/CX8Kh0m1yRGRfojGzbtsN77k/Pn7RoyZ13zF+0cuOtc5Zvum3O8s1z5q584NYFyx78+e0rHpw7d9VD8+avfmjO7St+PX/Bsodun7vywdvnrfrVbQuX3z93/urNqLP55/NXbJo79w5i85wFK4GlmyA3zZu3fNPtt6/aOG/x8o3z5t25CXLTwoWrNgMou/N+5DcvXLDy/rkLV96/YMmdD0D+imB63qJVvyJuX7DigTnzlz9AGeL+n8+7YzMxb+6yzQTKN81dtGrjvEV3rJ83L8D8+cvXh9iwYMEKh7mLlm1EvU3QbybmLlx6P7FoyaoH5i+688GFi1c+OG/B6ofmLVz9IAHdAwsWr9g8f/GKjXMXrt4wf9GK9QsWr1y/cMGqDfMWLXeYO2/l+nnzl6955OH/e1Y2mzFRkOINgxHeMAgDlpS+jOEtRqlW88pAPAwMHMTisUlHHbsMmNKpmyKN7/vC1ZlQaa107UjLjq5k2xtvml1e2+LvvuV1u+frb8i7kH73li3+3lvesO9++ZUM8U7ICHv1Sb+U3vPll9J7AO8Adgd2C7Er5K4vPL9z1xdf6N6FQHoXgDrmqd/1T3/qKodJ0Bfw3HM7JoXYBdLh2We3T3r22a2TnvvTW5Oe+/MbffDsn16fFGLifz23pRgTkJ/wzLOvFfDUU69MeOrJV8Y7GaQnIl/A00+9OpFgOeQ4lHUC457848sT/vjkC5Oe/ONzk95+a6sn1kh7exC4QLNY/BPxSk+HyxtjnNQ3ZaAZGCh/lTaDZWqDMgAGEKuwpSUOyLrDGCMmmZT2zomSzbXJzp6E7NjpObmzJyld3R6QcPlUpkNSmXagkuxEWWVkcuMlnR1XAPNEsa40ncpU7q9PWZb1aFd19KTbJUIKc4rSmdw4GQhpjBGB7YqRziQFRErO4hGX8SSbzUv08kwSIcxE2T7SGFTuo9GMMhAfAxrE4uNeRy7PQB8tgxhXBnCcQrCQqzGbz4vvWzFtneK1jROTGCeJ9vGSbJ/oJPMm2SnWdIj12itLltUB37QF/YVtJNEhA4E2RKCdfZCcIF5ykniJXSsikdxNiGTb7kIwTTBNeG27yEBItO8qEcrVM5hHLocgZj2scsGuBYwRbt0iFUinY06hDDQfAxrEmu+cqEVFDJjwCs3nscGFiGa8pCCaCaKS5LGCyEGfhZPNi5VI5tEIG48ub5LYIku2SUWZaBNheQVpTUJ8LyHFMujfE8pifWm94rx4yT79MG8TSfTbLr5pb0hatMtJUqohaxPgItGvnm89SfAmwAVi8AAOTMJzgQtsCyFlXsaYMlpVKQPxMODFM6yOqgyUY8Dr5x1L/SVXYcagWiIhySQCmmfFJA1ighFB2hpfJCFOZ5HP+VnJA5VlGuVpyfnpslK8PFZe2GarIDleP0hefMASsIflzBcjb3NC+KjpI1z41iIFlMgcVpx5Py+RzGNZWqiPui6gk48BYDxPykG8hGSwhZhJ50SwqoVBYtG/iCciBu8gUvq/jDH9la2uUftblgFerS1rvBo+WhlAIDLWTY4+lT6zvZ1/BSS4XLEAE8QHyWV98VkBNX36VaS5OqMjtggMQifvoYAdNCj9sJ9K0ob9Ogk7LIaTovGcHnmnj8opw36DWcJatoPO1cMEoRGBFOoJNw4ahpL9WtBBu3yEPx9t/XISffg2L34ki+shwCZwM5BowyosSX7RP+4AqGOK/VGWQWB2mQJVKQMjzQA+BiM9pI6nDJRnwKODhiP2PG5p9a2TyWQCheElC3gJMdjqSxhsyeWsGEQxg7Rxnt2IgTNmujqSYuwgkPfERPBhUykqlUVjisBWH8AcMHcjkAjgxkAfyUgfSQQlg6BkKFk/0peTRf2AViHFJqwneEU3AYIVn8AKQeDPu7S4lzHowKXwFiaNgWHI6qEMNAMDXjMY0ZgN2koZIAO4hLl8iQuC8RsG7R8s/LCD+iV2W8XnTQEDfxigws5CYUNZKtiyVKd5ZSAeBvgJjGdkHVUZ6MdADXf4dLh9gka/TupS0HcPBnUN1q8yPn6WozcuDfhoFJE5WMSGSQQtw2BIIB1quUCLkgLusRJjhV6VppSBGBnApyfG0XVoZWDQDMCfMvY1CqGzrh14UAWLi+tjfBkM2J3BGw4X0OqVYVs0a/yI7A976NMl5xrqo6RxkS5UqlAG4mVAg1i8/Ovog2IAztf5U8hBBZJBtDd5kYYRRQV+DBuBhC9GnUaAZ4/gz8VONvfAA6XrFWlwWsgWEiKGD9VEX8pAczDAT05zWKJWKAPBMqcOHuK9fJ3zr8Pa/lUZKKilbARsSzAYNgKOifZcxboVKdIVDlclLDMmGfGct9kAAAmRSURBVDYMFSqGmQHtfiAG4vUCA1mmZWORAXriGuaNZQGeBbGilSTcr4c1g+ekxTMbAShrgkG7BsFxiJrGqWQTooNtFPzuGlaB1q2mfKlX+mgnYI481gwswzxdidVMl1YcfgY0iA0/xzrCYBmoKbSZcBTKOsDl1CBgpY6x+tWNTPZFGFDqhUQvtHfJeqVr1PtmkQwRCqGENjiQ4Ww94b5joNJ3ZSBuBjSIDc8Z0F4bYCCRwJIEXpJfzIW/dA4UmoLr7+0SpXT4bhXho9wP1jmojFWCYLEgBq1rgaDNYFDLGJXrCOwEsKo0DUIw81phEayJ0vqkQKy4RRnTBsnosCSTGV8wkhF+jyzn88cWqVQoA/EzoEEs/nOgFtTBANxoWJvbZ4IgAO8qfBXLKE39WED0Ma5XFnFjA2bZA1EoCfXMU49VGIKZC3lUKZSB2BngdRm7EWqAMqAMDAEDw9yF+yksjBEtzpDUQxmInQENYrGfAjVAGWgxBoy6jRY7Y6PaXL0aR/XpbbnJBXtaLWf22DI4oUFsbJ3wgWcbe6kGsdhPgRqgDLQOAwZPIQ1erWOxWjraGdAgNtrPsM5PGRhiBkzCmCHuUrtTBhpmQINYw9S1bsMmtlydYxOfnMg0a7EcizIqlYGYGdAgFvMJ0OHLM1Dvvb6FZ41QvkfVFjNgjBFjjFORN5cI3wJtlOnNGeE33hDBLP+XfViuQhmImQENYjGfAB2+lwGDV29OU03LAKNZ3cZpA2VgeBjQIDY8vGqvysDoZUBvNkbvuW3BmWkQa8GTpiYrA3EwEH3Z2dOVWBz065gVGBgoiFVoomplQBkYMwzgWWPpXD0vUarSvDIQGwMaxGKjXgdWBlqTAV2IteZ5G61WaxAbrWe2Veeldjc9A/o9saY/RWPKQA1iY+p0t8BkLWwkIMod/MOP4v4Ei4ixvv6cugzuRQ57e/Acs76hxhcp/LkbwYuugkBSD2WgiRjQq7KJTsZYNyVhEuI5B1rEBPI+ghoOMZ4n/HtWAlfb0QaHa3PIWrFoJ17wF56t5XeZPOgoJZAG6Upw331CeaPSYKxG2w5BuyKm6kryu2HGz4vNZ6WNz7h8cAserXhgV6StHcSzRxJPQC8m6cpyeZ8lowk6lxZmwGth29X0UceAde4ydJ9udtR47ir1xPq+jBs/Hnpf0ukeaU8mEQZEjM07wCOLwM0aAjrmo7KKUiz6aBywSjwYbBrsR7CaHAhV+0V70yhgc3syKflcBryBZK9NJJkQECK5nBW+MDVmmRRxNwhM8qxQKpSB+Bnw4jdBLVAGehmg6yR6NSKIXYVsJkOHy6yFo80JXLAk4MSJpNhCulyeuv7IoU3jSPo5GQzaEGwHQrW+EwLbG4RBu3y2R4zJC4gEqZBYmYFGYZhqQ0yDEocHCNTBmTGGf//ZqfRNGYidgeDqjN2M+g3QFqOSgcBLFk0tWIWJtMGjJhIJBLS8JLB6GDduvOQy3VhF9Eg+u1389Dbkt4nNbHcyyg+ndH2nt0oO8DPbJE8gzXy+Rhm1qySr9cOxGsd2yWZ3ivWzAtIEZDrmk21GyHsWail6RSfH8zSIFdGiyZgZ8GIeX4dXBgoMYLeqkI4SiUSwHMjCo+bzeThcH742Jz093bL7bpOyEzvz3RM6st3jOzI7IXdO6Mx2jW/PdCG/Y2JHtgv5SHaF+T5yfEcKdVNd4zpSaJ/aWSyjsipyhytvTzk5oSO9Y0JnugsSYxfkDuR3QN9PjmvfuSNEV2f7zi6k+8jxHd2wr3tnsRwX6LooO9t6dkQY19azvRTj21PbgW1l8Oa4zvTrnZ3+m5Mmtm0X49tkZ7sYz5Nc1goel0kQqugiPKzCuLEYnpUEsmFShTIQNwO8QuO2QcdXBiIGopv9KC8MXoUMEm3JNkliRbbb7rvmzzn7rG9vXLdi8oZf3jH13ruB+5ZOWXvf0qn3rV82dd0vlu2/DmnkIzk1zPeR69Yvn3rffcun3rt++ZR77wOKJPVROeW6dXdMWXPvHVPWrQvkxrVLJwNTgMkb1i0tlSyjnnIKy9ffs2TyfWuWTC6W69fcMXkDAPnhjWvu+PDGdcsnbwYo1923csoaYO19Kyevu3vV1Hs3rJpCGekp712/aur9966Ysmnt8skb1y6HDcunrL9nGca42+XR9xRgKrFp3fL9CabvuW/V/vesu/Mj6x+4a8r/+s6M/2kSNpvDc0Y+d2S4IjzT1z0gtOEM+GLE/bdFpPVQBuJnoO9VGr89asHYZgBBzPRhwMPKoKOjQxIIXMYYyeayksvnZOeOHfkDDzzwiWnT9n/x8MMnP3/EEVNeOArpAo7a/8VCulg/iPQnPn7AX4px2GEffakeTJ9+4MvVUNxf8VhHRfOBLNYzzTbF/R555MGvHHnkh18p1jHNegTTn/z4/n8ljvjoR7d84EMfeNrmMzkRX4rXWD6eNfaeDJyaMIPdxN5MqFOhDMTFgAaxuJjXcWtmIJ1OC7cSk3gWxkbJRFKstYlUqifYa6RS0TADST/fgQdiCW4lshPcK1AAdA8eV15I80CQ00UYiRhR6GADM+ANXKylysDIMcAgheAkxhgEqWBc3/ddXrBKyGbTSFvJ+1kxnpU2DWEBSYN8z+VSCax/EyZcefF/JrqlloFWDJh3OTGGeQzmeWECaT2UgZgZ0CAW8wnQ4RtmIPCsDTfXhhED4QK3KDAxWdk1oLRyYdSpSmVghBjQi3E4iNY+G2IAqzC/ekNW8YWrBtTXQFadsKo1jAn2CLkC61fZFflQhwDjxor6DTCiR3MwoBdjc5wHtQIM1BuUTM5gUYCGegyKgURnB5lEeAq6wXkIEoV3HykCAocxnvoN8KBHczCgF2NznAe1ggx4XoJiIGAVgFUYahjf5hDFkNIjYKDh9zZpyxuTsMFKjC6BEDyXZFzrDV7QCO8ajNigQsMjakNlYOgY0Itx6LjUngbJgK3POVrP0/9gMEjKXfNkMslo5dLGMEyJGEPJAFYoksLLV94LXGgidgY0iMV+CtSAiAH4TSMG9/tApIskVYRbhhnnWA1fUbnKxhlIJBKeMfwPinAH5RZZIB6HEG4UI6go+lIGRJqAA70Ym+AkqAkhA7bXT4aagQR9atXtx4E60LKAgfBmgHyKuP/IIXhxFYYbCotk6WGCnwsuVWteGYiDAQ1icbCuY5ZlwBODxy0iwUJL+rzoSwOwCuEZ3/e9PpU00xADHrZlPcckA1eA8AEZzghiG4jHIVbIu1jf2kRDA2kjZWAYGPj/AAAA//+SgPIBAAAABklEQVQDAF33czVtLzdSAAAAAElFTkSuQmCC',
    right: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAbEAAAJBCAYAAADIqos1AAAQAElEQVR4AexdBYAd1dX+zsy891biTkjw4BCseKF4Ke5aqGDF3QvBpcWLU9y1eHEpUqj9tNAWh6JxXXkyM//33bezedkkG9vNSuZlvrl+7rnfnTln7p23Lx7ST8pAysBMDHzyySeDhg0b9h4LYsHMXKh4glnlJWVtGQ4fPvz/pA9lpkfKQMpACwZSJ9aCkDSZMiAGampqIoZyXAw69vA8z4SO1SLtPWWgczKQOrHOOS/dW6suMLpisRhSzU7hxKgHqqur5VQVTZEykDJQwUDqxCrISKMpAwkDURR1GgeW6JSGKQMpAzMzkDqxmTlJc1IGEEXOiaWOrPtcC+lIuikDqRPrphObDmvBGIgi58QWTEjaOmUgZaDdGUidWLtTnHbQFRlIv0jRFWct1XlRZKBTO7FFcULSMXcOBpqcmHUObYC6urpOo0tn4STVI2VADKROTCykSBlowUDfvn2tWCw258bxzK/HZpXX3KCNIkEQoFAoWI8ePdpIYiomZaB7MZA6se41n+loFpiBsoCxY8eGdBwze65y8UI7l0ol1NbWhnSYHa7LQht02lHKwDwwkDqxeSArrbrgDNAY2yuvvBL89a9/zXz88ce5zz//vIrxmvfff78H073+8Y9/9PnnP//Z95133unP/AF//vOfB7/xxhtDX3vtteFst9Rzzz239IsvvrjMSy+9tKzwxz/+cbnnn39+xLPPPrvCk08+uaLwhz/8YeWHH354lUcffXTVu+++e7V777139TvuuGPN22677Qc33XTThjfeeOPGDDe9/vrrN7/yyiu3uuaaa7a97LLLdrziiit2ZXznW265ZbtHHnlkv3Hjxg0yM5iVseCjn3cJZgbqMZi6HnDRRRftc/755x94zjnn/PK88877+aWXXnrA5Zdfvi+x51VXXbULdd/xd7/73fbXXXfdtjfccMNWN95442YcyybERhz7+uRg3XvuuWft+++/f60HH3xwDfIz8vHHH1+d4apPPPHEKs8888zK5HdFcUmOlxevb7755rLEkm+99dbiDAdpTjQ3miPGe2vevvrqq2rOXY7pDOco4Bz7hM37aNMWKQPzzkDqxOads0W2hQwWncTONHRH03kcyfA4GrzjafxOJE4hTqdRHEWjeAGdwCUPPfTQ5TSYV9NwXnPXXXddSyPq8MUXX1zz3nvv/e7VV1/9HWVc9+67715PJ3UDZd70+uuv3/zCCy/c+qc//ek2GsQ7Xn755TtY707iLsbvZr17WH4PDew9rH8v+7+POt3/9NNP38/+72f8gaeeeuo+xpV/H+uqzr3s527WvYttbmfd26nnraz7ezrCW5i+ifEbaMive+CBB66nrjfSEZ7PVdAQM3NOTJNuZgoWKjKZDKZNmzaYfJ5Nh3wNOb2S47ucul7JvKuIq8n37x5++OHrGL+B8Rsfe+yxm4hbiFtZ7zbWv524g2O/k7hbXJAX8XcP4/eS1/votMSVcD+5vp+83MfwPvJ8L8vuYR1xfzfDu+jMNC+3Mvy95ovc3cj61/MB5Do+lPzu9ttvv5YcXnvnnXdexfm/jJxeTN3OpT5nsu5J1OUo6nEYcbDAPg4SWOeo++677xfjx4/vtVBJ7gSdpSrMPwOpE5t/7ha5ljRaa+y3334P7rjjjpdvv/32V+68886/YfxShpcQF+6yyy7n7bHHHr/ee++9T917771P3GeffY752c9+dsQvf/nLww8++ODDDj300MP4OfTwww8/9Igjjjj4qKOO+uVxxx33sxNOOOGnJ5544r4nnXTSnqeccspuZ5xxxk7E9meeeea2XHVsfd55521+4YUXbnLJJZds+Jvf/GZ9rprWI9blCuQHXKGszRXHWlxZrfH73/9+JA3o6jSeq9Pgr0bnuSpXYavSkK5C47/yo48+ugKN+gg6uGVpvJeh4VyK8SVo0IfRGC/G8Q3mym+IVh1/+ctf+jU0NPgdPcmFQgF0pt5nn33W89NPP+3/n//8p8///d//9eKqR+ijVRF1Hvj2228Pof6L/elPfxpK5zOMzmYJYimObxk6jeU47uXp6FYgFyuSl5X4QLEyuVqFK7ZVuHJb9dprr12NK7nVuaIbyRXpGuR3LeGCCy74AVd/G5577rmbjho1akvOyTannnrqTzhPOxG7HnvssXsR+x9zzDE/O/LII3/5q1/96hDO8SH8HEYc+dOf/vTY/fff/yReD2fstdde5+y2224XE1fstNNOvyOub8INzBOuYNuL+YAzPF3JdfSV13X6T51Y15mrDtX0c2770aivN2XKlEw+n/ejKPJpYP1isajQY+gggyuEYegJjY2NXktQjjHPQfEESZ5C9mEtwT6MMo19N4fUwQh9+WEGsC5agnrJIYAy9MfMDoonxEqO6ihPYD+gMXVQHcUVLmyYGcgRyIcbo8ZlZm6FKD0F6a38Smg80lmorKP8BCoTNFbVUfukjP01c035+qKLuHZQmeaJdZvTykugMsJjOwfK9VjXgXX8BMz3OTa/vr5eDwz+5MmT+40ZM2a5Tz75pOfC5jntr2sykDqx+Z23Razdd999t9TUqVP31bD1jbnE6CktJIZQ+QmU5/s+PM9zBtesbHjNTE0czKy5zGW0cpK8StlKz666ygT1LZhZc1XlJ3KUqbSgeEsoP0HLsoWRFtdmZd3Fpfo0M+dY6SBcKP2UXwkzc7zKMQkab2U9s3K58ipRKUNxtUugespLYGZJtDk0M9evWTlUG6G5AiNm5TKz8jiY5R4otHVqZv7XX3+9IZ3aYspPkTIwJwa8OVVIy1MGxAAd2HrESjQybjWjPBlYhS2hOoKcR6UBlTFL0NwmjmcwxMaCZpjBrAlN+QyaDzOVgXUExWcEPEMURw7qF/xYAtdWKUBGmtnukKNI0tLfZc7VSbdSAkCSK4Hmz/Q6zVmtRBL+KqtoLAn3ZgYzg8YqmFk5zQaxwcXNGCEXKgejgmSQeJhZGQAMTR9FKsHsFknmzPqQ3ErMqlZlueJyXgq5KnMPPBMnTtyurq5uqVm1TfNSBloyoDuqZV6aThmYgQEaGOM2z5LcStQ3z2Amk4ZmZzZDZSZYn/YxnsE5MHumQ1I8eDCCJ+jj85QhPEJyQONrZvDdPw/uo4aEyt33znly8QqHGMNlwslVM9YHP4oG5sGjvFhWnnk61F6hnIZCIXFmis8W5gMCJaIJxjAwIAFrODXgPh7PBMsrMpk36yPRS6WlUkmBgwy+IhqCQMIhJPXd+MmBQoGFrE5O1C+7J61kQFnMowDpyGw4nVTH5ylQThkex1RGuYrqleVigT8ai5yyHhrEP6+zpenIUie2wMwuGgJ0hS4aI01HuSAMBOPHj+8/adIkWjbAzKAVi4wOFvjTdAnG5bB8ni40jsorKXVssOkFjFENnmmeZ8iWBKJJHu24q0O/BRluJcqrM8UE1lWwIIjpCKiM5/vwaPyZQokn/fqiEFK2+YAX+DDPV4pAi9Fg/j7qW2hqbQqVZv8au9ICXG+MGUGnlegVixT3/30aa1i5GviRDHLPWNPhtQibkgsYyHlJhLZGk4cGviPLcDtxiPJTpAzMiYHkypxTvbR8EWZg9OjR2TFjxvTli3njB4IMjrAgtMjO6j/JUgjaT0HpBEpPl99UIclgI9nZJAnoUvbYxOMKowkx06xn9CIBhWZY6suJGPMJPwimN5/fWLMSRa4884jiEmAR/YdHlXKIwF69wKWjMEQcURmmQN1iAhUf8SpUZLUeNRWrnwC+l0EmDpDlGDPMzjAM6KyaEXnwCIRsFBHkKza11UNAjBJ1onagwjByptBBccojfS6psCmLuQt+yHlJisathyI5tXHjxtnYsWPTr9mLmM6ATq4Dr+JOrmGqXoczkM1mAzqyar4TMxkabfnENN4yPG2tnAxkAtph0DoDZpCBFWBwHwUZnowZRreVAEzL0KLp4zOti5zqcnUUI6QTKa/EWEuZTfXmN5Af9P0YHjuhmqAXK4vy2BcdmvkeIq5o4jAC/QQ8njJ+ACGQQy3Xnv+zsSnlR3KQzs2IPebxMGOhAJ/9GgJykeHZYxrmA24VZoDHyoRaGqNUER4doODSzFOZAx00xTCnbQ9dT4LP1axW/FyNZdu2h1Rad2WAl253HVo6rrZkgE/HPuEMclvKlWF08pqsJU29M8XNhpIGGjSoEWLms7axIo+Ajeg7uPow+CxPLuSY9ViLTg8OXpbGmpVDVojYLm72Niyn4TczmBnm9xPSOcn4JqsXSaIdhlEPUIM4zgM0/EZPYc6B0JeFXLWFBa7KiqwH9zFTSxeF2fR4OaeVs3FgzSs6Q+z5iOkkIx8oeRGK7LtoJWpSopAStShRi5CckaWQEL/qjvXl11hJLo714qZQOUIEqB4qPmxekZqvqKf5aGopHgVuXYOgRk0FaZAy0AoDvANaKU2LuigDbat23759C1yN5fmEDBkZn1ZaUHzBe6JxdELKYbNdTAymDHRTprN3HhM8ZOEEbdhV0b1l6TQChgHNtXH/0KPh9mjAo0IJjIL23Nlgsxjassr4Hnw5ANc3YJZ0iHn6SL3E+OtmEtg9nQTgU5LU1Yoxw7hP/UD9ygCs6f0Z5vfDzj324nEcAd2OwRBydRlyBcgIvBDwDPAN3NQEnRe43RhBnAmOtxDwi1SgBM4tw6bDY2jklMGMh82YXNCUVqmS4XFyBV1TWvEz5KOHSlKkDLTOgK7V1mukpSkDQKQ/XKUTcyZM24kyPjI6bUYOHVMiqyIKo4E2M2eIzdg9fR39EI0xoN91l6WTc8igxLyQiJGjIa+KgVoBgF6uqG6GaRn3sFiCcQVlrCdZrOIOM8p3sbk8NVWnKIkF7TCyvKN89iMEDAU/AjxE1C3iNiLjVDpivVLECk1d0WjTiXAdSZ0Ub8qeYxBrNak/I6D8EjkIGafvhsbbj33UhEAV+w8oKUMoLCOiMwMGMq8fkZUqAuOA8Z9YldYofySUfbiEuXObnMwMZmXomtK1xWtNK/5cm3SQCun2DPAy7/ZjXKQG+Ne//nXAo48+OvLee+9d/YknnljriSee+MEf/vCH9Riun4DlGyTxRx55ZH2VP/bYY+sy/gNBceUxvv5DDz20Ievu8t577608efJk1NTU0Fh7zuDK6LQruTSq+nYiO+OhRAgtDmSEe3PLbFh1LdbvOwCb9O6HTYnN+vTDJn36YtO+ffGj3n2Z3xcb9eiN9fsNxMq9+2CI70GGXCsMSqNJ5jgMC/Zh+wwVWmJQgA1W74+tNhyArdbNYYu1Amy7fhW2WS+DzdfysNkaOWy2Tg1+uHYGqy1vGNTbIAdK++2MeEslzFhOtMxvmWYtOviA8BGYhyofGFqVwZq9OP7+Q7F5v37YrF8f/Ij4IbExedioV29swvKNe/fFyJ4DsEy2Bn24ZJPjlXx994NMi2olyxBh5dhsz/NbIKct52Vm0AqfW4neO++8swqv4d3uueeebYgt77777i0YbvbA4OkkiAAAEABJREFUAw9s9OCDD26QQNenoGtVebq2FW+6fnU9r8W8kQLz1/rXv/41GOmnWzHgdavRLOKDoTHI8GY9eNddd3193333fWfnnXd+c8cdd3yd4asMX0nA8peT+G677faKynfZZZfXGH9dUFx5jL+y5557vsT4HZ988snKlG/19fV6Sm4zpo2SBGcxaSgVFwCeadQChhmuYwKGWgz4MrYAsrSyO6+3MY5b90c4beSGOGXVDXDqKgTDU1ZaDyeuImyI41bdCIeuuj5+ud6mGBDGqGZbHUV6kIhgl0o6J8nxuXjlycxgZpVZLm5m8PgurrpkqOJrr3WWy+DOqw7ATRdugbt+uyXuvmwr3HnJFrjzoh/hrks3w20XbYgbL9gYt1y6A2697OcY2qOsSwA4+R6XcWbm4mYGfWalj/IrEbFuIQ7Bt2x0ihFyIbB670E4caMf47iVN8QZa2yGM0duilNGboSTV98QJ66+PsP1cdKq6+EYpg/bcAv8aMRqCLgqzADlaWD3ZUdGJ888HcwqF8LFGPeYLTBYgCMZo5nBzCBnJrz22mtr7rfffvcSjxNP7b///k8zfHavvfZ6kdfkywn22GOPl4Sma/VlXduK85p9laGu5zcZ/rkJr9MJHsE+cwugctq0kzGw4FdhJxvQIq5OrPc9ZqabtIpctBWylOXx5mfQtocuQMEoVmDQfNDHQHkqTzK1ivKZCIiehQgDG/JYfFoDhk1rdFhyah5L1BWw9NQilqorYunGCMMKMQbSKvdmGxEjmfB4NoJ5rR0as1BZx6zcTnp58CFdMlEDt+2+Rrb4IfEv5PL/RlXjv9Ej+hA9id72EfoEn6FX9gvUZsaixge3F+HGhzb4mJmTJV1qC0UMJAfDJjVg8Qn1GDqpHotPacRiU+sxrL6RyGN4YwHDGksY0hiibzGCLhSTHjpRVuykKaMMj4FPuIPlLmzfk7rMsgtNWSWk6jzDzNQmo/uDMtOj2zAA6ELpRsNZtIfCG7XE7Rg+nJtsmVtddEVG4gqldYEa0woZNB9ZbgZmohBWaiTqEZTqkQkbENCZZBlmw0ZUhXnUhiWHKtYNuM6QHAFceZCgZnlzGyHHrqrC2HyU6MJKzOGiDFpBxNQnLuWBQgFxPq+XiYw3AmGRKzfme42I/QYUOSjXjm11tHSUypsb+OzYo8MxK7Oms8eVWY79V+cbkWmcBr8wDSjWUYdGGDkRfIbZUgG9iiERcRRNvVGvphgoFslH2UKSVtgyrbwFwfxyMA99Znh/cBJQmIc2adVOzoDXyfVL1Zt3BjSnAm20TNq8C2jZQsZFaJm/oGk5gohCIjokBq0eIR2QKtBmuycvDTDDxl5YgBcVuZVWQswwpltJgLhIw12g4WYZnRmru+8GKnQGmPS4UIJnA+kotCwWH9KFkp321iTIi2P4cUQdQ/jc/zTqZ9TD2L++hBHTwYbM0y96lCiU1SFZjM50mDUJbVFiZjAz9iGAYQxQi4jnULAivLjkELPvmHEwNALsW7oYufIYz4QRnX/IVmhi2EUrTh6MsisyXNTMmkIfZubgMhbwJC6EBRTT3NzMHL+SaWbgtq2H9NOtGEgntFtNJ2RMeL/KNLo4FvRDYQsqomV7lzazckjTaSj/YwAHd1XGLJFxRvMnsuYoDXcEj6urDNcQvhaeZjDfQ+gbSoGhGMQo+kKEAsMSISMfU4Tg6R0UO9P4BDO2nwuwefMRc8UTNz3UsynMpHhZjuezt6AAC4owL4LPf15Mgx97MErwCIUM5vowM5hZi/qR40lj0N/ClVhaYN9C3ucCLOuhSEQZD7FnbO/D9zwY9XGgwwWdVAxQDk/J0SLDmO/4NxWADw1wEpqS0MfMFMwXpH/LhrPKa1lnTmmzsk6SJcypflre9Rjwup7KqcZzYsCsfOPOqV5HlZtN10+rmTLotJitOC0sHDD9I9PpwDrK1YUrAxrRncV0HkKJjcqIueIytyYrG26DGZ/I2ZCuhSYb7umcyfk6ZAybQdNP0aBfoCYSF1N+yP4VEgZEDtKY4POF9HZtVH0uYUYhLeqalcfEHlwJF37UxkVdqH5LjEWCiI09eAToTGO6IHg+QMcWe9STzeQEGVCcB+M/nzCXAUoglGiCx3xFGcxwmM0qd4Yqs000c0qOFJ9txXkoaCs589BlWnUhM6BrcSF3mXbXngy4FcYCGJL21G12sp19TWyfwgqEznwCERurHgN3qArg0VmAayEPJRrnkCi/6jLXIKAVD0JDwN0yL4xdu/KZxTKUTbJdwTyczAxmZaiZ8WS6k+QM6Emka0gnUYwC6hVQxwx78p3jlFF1f5pAndSOTef5MDPXv/iIGXcCODCfEQfG5ax8hkYOQA48ByoZeYgjn+/kfPANGfLUuUCU2JZFPPNgO31TUbLYghmAxDAbMDR/VGZWkdFc0gkjVMnMYGZuGEymRzdhQNdhNxlKOoyEARlKxZNQ8dnCWCIwSA4lZ4ekjgtVSZF5DOOm+jQobO25rSlGgKZ86KO4B9DWc0VFI8p4Uq4iVRFirSaMDoKhHHiG3iTLlUaWDi5gA6Pzcn/UzMoyymrr+vcpkHXBemWwAl2NyhKAaVp8QJ6R9WJuXcYuZFtW95rsoeorR2mFGpdb3VCn2MsBloFZRMQwOjfEdGox3LhCgL3E0FxJnNERl/WRpASsYwIbsb4h4pnrKyshotxIDZnDKtQQcA7LbRMCAbdXHSfs1/HBMOa4I43DgCLrlQhJpAh2AhjleTDWAD/NJeV5ipnFI2JpSAARNF5mzf9BPVxjhbOCKyyfWhaXc2d/Fq8qlY4el8sMY0F5KboHA173GEY6ioQB3ah60ueNmmTNPpRFcIaIl4GLAwqYoqnDDFCeYGj6KDK/AI02IT292LjFRUERwCx4jDKGpPOYy4lQv39oBvgeohIDVlD1UqgzjTldnd5PqTBbjFHFbPfrHHQ+UVyCeeyP76/YjDV5ljfjSgzwON4sIacSw5Qf6GSsxDY8e4T7VqP+asGyAB0SnDFkeUyVWZVJ0FdA7+g8OgQLSwgy0qvI/mKEURG+n0cU1SNjPVDMB4jKgkF/Bnkekxzq4xEgJzFDIZfRN8M9gO/4kGMl6u0DoH8Eu0fsl4gYHCpzWY3ngAJLFqNkRYB9Sy+fXPFVGSgakUXwyYsnWX4WMet7bCcwgJwYmFsGYByg6zMGUCK4qosyAdSHxhFTHrwYMfsUYKwzL4B6nh2aZLGOEV4T/KZQ3WAOHzNzDwlhGELX3Byqp8VdjAGv8+qbarbQGEgsAUPZqYgdK6wEs2Y+VEG58xuyrW8+Mp7MLkC7jxoayVoiEwIewxxXUlWFAmSEs6UINeyLaxvUsG0u8GCJ9Ya0Rtl+sg5tKvRhFEKSVp7pxHa0uYoRMfwANHCM0tiDTjNXkwHtNM074DPbj+vh0QnBGpmiU6LQLNGbPoZNqR9QTSFyFBEdZhSF8DNsGwR0OD5KIdspj1t51UEO6ts3QPafng5yugEjORRRhRLTRWQZj4v17D8CbTZALjyU9SyVGAmIpsMYSk+Ve1zNRXRQ9DWIVAC2Z7kOpWNF2LFHh+uzHvIlN84cZVaxsCaKUMs2WeqRZb0cycsxX38o3pNtc2xjdAigcwP7MgIUbPSQAlh37kGNVZ9ym9so7hC5c/mkuKBUy1B5cwcre+i5q5zW6hIM8ArqEnqmSrYXAzRSzpLK2DWBtggygM1g3/QpEBh1jkIGx2h8jAbMn08YLbNWBSFXBbLHfQAsRiwuFIFh7HBpxpdGjOEMl6DtGsJQv/cnYxrVT6EuXAEwLzYPLEaJV3TJM+jvsCKOJ/J8RCyLY2Nd0CHAvSPLxB57Dym5gNgIn0KkhBlQCpGvL8Jk1JldxSwZ92rEcCHHLWcqR4oGIMt6WdaLCg0wM/h0ykZyClEe+bAB2lo05mWCaoT5IkrTJiNTBPS7hr2odG9C4+kFoJZQvAdD9dHTA3plmCgQ7KcqqKXeVJQ60McA5MgjVMVnFVZ3q47IyAfh5pCZSShOmr/Awfoo5dGD18BQxsX9IIYDiFoKltOSc82WYvfQ0J/5Q8hgP/JQHRXII0HdPQpNrgEvNtbw5hocCR1o5MCZYrsIRudaBsCuymiKRtA/DbscxsxPj0WbAV7eizYBi/ToZQGEiCwoFBh1Bw03ZgFVEVSketMvoCQ2b6EcmFYEcmDrDR2O7ZdaAbsNWx57D18O+w1bDnsttjx2X5x5iy2DnZZeAbsvvTx2XHI5/Gjwklg8V8UVEC24FKHzgBwW4zLYRapR5EqhpNCAAiG9NVRWoSOAG57nlkPQrhssBKASrsaGUKFf7L06jj1kBRx70DAcd9BwHHcIcfCSOPaXS+C4ny+BY38+jBiCo37eE9tsMggoTUZUKnBFx04tQMy9tpgGXg40YqitrKg4Df17l/DLffvj9KOWIVYgVsVpv1oTpx66Bk45ZDWceMiKOOlXI3DC4Svj6IPXwd67ro0eXPHR1yCmgwUydJRV1DRDg28AHYdxNBpbCKpBFMlHxLGVHAceQqZD80A1WMqDTtyP6Ty4yl26d2/8eNhS2H2F5bHH0iOwK3nelTzvttzy2HvllbDniitgT+bvvtzK2Hb51bFmv8XRi/1p5cnOKUyHpxMxr6G0ZrOKI5GgLNOpAprDSlQUzVU05meuKqaVugwDlddLl1E6VbRtGJCBCGgRBJ+hERAkPglpKkHjNwOYp2IhRIT5Rcy2+jJEhv3pKX/dwYvTia2EXZcYgV3pwPZYYnnsuvjS2GPYCOxFx7bb4KWxy9BlsNvwEdhqsaWwXLYGVUWa7VialM0p7TlCDqTkA0WB77jyTOsbeAUkBh5QPOQ4IrdFF0DbgPoWY3XTluXwPsCv9tsQJx68Lk46eCU6lqUZDscpBy+Gkw8aQgzFiQctQYe2DA47YEVsRifmYTQCCgpLhijMwrce3JLsRXNfRVpzgPNCE1EdfIs9dlgcB+wxAPvtUo19d8k67LNzDvvsUkX0wN479cJeO/bHvrsui11+PAI1vFO12tNIzTmxGvZBR2kB6Cs5HkMJcMhzJVrwOUbnwIx8wNVRW1ZpPoIoQnUxj6WyOWw2ZAnsNHgZ7DVkWewzcBmHAwYtg337DMM+xF59l8D2fYbjRwMXx7K1PclcjMawRNkhEU0H5zScB5AqJAh5QSaQrglIIGYLpJ9FnQHeGos6Bd1y/DQHczcun9WCJigu0OIyh0ezFWFcR8u08gT1Znyino8wpsGVWLoi6F1YXzqlPvWN6DWlHr2n1aF3XT36NeYxuFjCwPo8+k1lPvP609lkGPphCPqoJhtHHaiP0gwqDg/JA3isXOqpUFAy0HsrOWpK8RmKD/1SUw4TEE79mPgPosn/BKa+R/zLIZr6PuKpHwB1/4Ff+gJBPAFRaTKqcgE8Oo+IKybf2BFXdfpCgZ/JQv0YimiY8i2y4fcoTPwnquPP0IOoxqeoss9QTdR6n9rADbgAABAASURBVKJHwHz/S/Skw+tX24hSI5DNAL6bHG6l8f0ajOMV5MTZl8bDHDfWWBENzqF8mxvjHisJWoUJWgVnS0X05Uu2vtPqMWhaIwbXEVPrMGjiNCxeV8CS9SUMbwwxtAQM8Xz09n1ElBVRHz00uC9zIKRmFK4SdTS3oeq2BGVzKtAMzOKTtJlFUdfLSjVeEAbKV/eCSEjbdhsGdDHINvgckcVMOTDhLBZD2iiVl+E5G8Pc+T8oKKJFpX3mSoKrCO7nRVGJT/mAz2VR7BcRegUUwqkIowbmF+BFRcTFRphHo8l3adxfg4xxGUBAXYMoppMA9OWQHOMZrjgojg4AlAGYG0dM/UOAyxv2QNcSoYQYeVr/GADtNEp59RfBo8N07UsZBFxhBaVqCNmwCtVRwPdbEYzON/B8NDbWQ7/W4VkBiBspaRrisB5hWESpGCHwq9Gzti8ysY8+2V6oKQWoCgPKyaImzqCGWtUY0MOK6OHl0asqRM4vEOSnSCAvLekipgKB+oigj0dHFjBCv4KAq8sM32PluHcYsFi6u5Bx0u04YhesDRS8CEU6QiMpVsqzrIislZDzQlRlIuTigktnUISFeWpHB8ryPFuzG8iJIWZCYJDInduQTcgTz2o/N2DV9EgZqGTAq0yk8UWPgRKHLIQMBdkRRp2x9xlpCV0wlWCVBTvYoRyG+vHocGKuuDyuMnwaVVp+BDkPJRpNObfAN65GfOpm8DyDDGgZFILyx0PMcoC7etAWqQOtrQtZxSMk2qMbiAkunwA6OXoXwAtQYvuIdaSTsaJWcNKLBfAjH36YgRdnHXwE8CSbq0HfQmSzAeobGxhmkQ0yiIsFZOnYpLeZocAVDxdmyHhZ1E+eCkqB5MZF6k8Hpy+UGCsYV0XGd2senYYfNqLUWEeHQqUM1I4hVz10JYywnRE8jGPxmOMQAT6dmsYsB+bTMYsPFlNvQF+miem4Qnq0AihJvAY+fLoo52zpzEJuFYrziE4M7M9YF2wTcBxy1j6FcQoojJEFOairBqVhNIPyjLNoADXyCEz/cKwuoVBwifS0KDPgLcqDX4Cxd4umcgAhrwB9+UFw7yNoPEIiGaAMiUczMj2MIENmNH7G/KTefIUyQiW4FVMVBVRxVdMjyAENBXg0bs6o0WgWi0U6LY81aDO5TaftujwdR5EV9O5HvzqRZ4OQaY3BVeTJ2V32Ecsx0FKa8gijBabphuczEgTM4UFnE9PYg/05Z87uinQkMtwxHYJnWXhcKZX0AkrE0YKXYtakYTd6i4iONl+qR3V1NQp5Kk/FsugBKwZsl6PihiDIUrwhz73BbHUWJckXj2aIKQ/mIU64jz11jYjOpLqqCvSVDj7rhGwDDcYH6HmgJhwm28Jlm/QiTz5zJNHgukdMXUvkSXNN9SBQKajfxoZ8WYdcBnqXGGY8NFJOnPEZltDIPi0TwPcosb7IkYErUKhrtgfKHQMuBCB9GLQaGitlKSHLihkX+lBY61dxWJ6Dx3zBGKIZSD8pA80MeM2xNLJoMqArwOfQFQrGOI+I0EE7A6PhVAhanZCZBRo3+h6UHQYb0eBiPmEWONPk5BYKiLkNlsnkkPWzMDM6hBKqq2oh410qhOCCh07Bg+exXYarHRjkU6CQzoYH5IvAiHM+rFcuB80wEILgYKRuxHFAKyBu8UGDYab64Yg0VFRVBTCuDtWBx7KY8BJhTloEigJ37Th8xqQcHYU5BQymLPbnQWyWoeYx1ANzjYU8ynnUy5jHsgg+c4k4QMStTGO6UAT8gHxQtsZAaw/XeQxw6K4HQ/ljZvDohEI6+riJB4tiUtIS7FPj5wozl6kht4aIOhh5BVdmGp0WqZ46AOh0I4TSh/KpHTWlCuqfjj0mN0hCxVU6h1A8yCFHlB0h4nAMGluJ/UmsZxmWgCUewzLcGCXXgdnzeBg/89gkrd7JGdCV0clVTNVrVwZkLWRFFApNnSkqgyLIaYUWQV9bd7Yjy0o5QL+mARkrGlkjQMxb6EHy1IdUCLM+SjK+gYcSjXWRW4u0wfDNR0Rj69HRVPk59sg0G4X50L1bynI5maEhDlgS8F2TBx/SQ/aqxK1JJ8tilABQlNQEMgYZaqg+HSdonD221/afB4CvsNDYUEc5ERGDlpTOkwU6jGnjuzlyIqMfsz/msCQCl15EgcgDfKcFa6iISwPw48G1o8OIBeZwCBAiKhhZlg4nhwgZ+H4NCtxuZDWARj2kjlQItPhgBSBgYzcXgP6MgD2jke8Vjc67xOWbsaEPg2cGcaR3cZnYoPdlQq2XQxWdZQ1XPyCHxcjQSD6iKEZ1UAX9AkoPy0H1AsqKOTdF30M9gAaPJ/Mp3TE/H6GPkM6yxDEIBT90HDTGeYQGFLwYIaXGDuzLHR7ZRhM8lrjM9LQIM+AtwmNPhx6TAtpdZwwVKi0Y83Uo9HgyFjIAHQuSK4ZZzpCysZUjNChqjLkOoQ+3yyRK0RJf3BToaopxkVtnEXxu9wkhjbEWTXIwRq+n1ZqZwaOhlknzaey1UrKI1hAeYvMQOgSUxnqZLDw/QAiAu2xAzAiNtEswjKmDsZ1PzfPc4pM+uWqgqiYHeGxFYwo/QsytuIjpiFuHoU8dUURkAcVlAbZlZco2JJ+YvAlg/XIeyaPTRBNi9pmUxxZCcb2niihCZWC5xp/P55FlF4106kAEcOyQ1fczHBBANQCOSQ6fAdQe3CaNNWYDIs8HjGBoDH34koxAepCQ/LR6xI0ll64iV2aGEp16TN5JIOWHiLgUjMNINCDiZJTAD2XH6hTkRgrMYxhrRviQ4ZpSHBQhx9A1p5Dy3JODxQD7QsVHSaEiK40uogx4i+i402GTARmBgPYhgc84s50tcUZDFWRoXCZPLLcI4AMz9DNEAeNGQxPT0sW0pPMa+mynb+LVUDTNMbssUVoIGWEZx4BG16PBBY1nFa245wUoNDRyS6uEDI20ymOuHkIa44hLkpLKWT9PQ10gGikxb3RofhYl6s6DPfGgX8rQ8WksRh2MxjOXy0JP/yHYYw6YWgK0IihxkGFAh0WUggJKfn46mBexD/BdGWK+1YvYkGEMvsPiaiqkgws9j3IDqI5FGRjrKAT7AdQ6pIQizAqAcfXmQsWpAEKUwnpkKRbGYipM/wLZdEjZPEcUAr4BAQuq2Rd7gpGHxihCwQPyCQ+xhzyhlVZIvmLyFseGGm7V1uiPxosRPG7XxsUQGfKe4ZaiugiyGWhV5uaDSmje9bd0tQD0s1sedXJO2qjvPEJtNRafsgROA2M8vAhuUOQHkq+04s1gHXewngvTUzsy0OlF8zLv9DqmCrYjA7oAhBm6MKYEBs6wxABtOaoY9qTd6EXD2ZM2qx/TfVmnTxMUn1foZ5d6sT0XPgjyRQRc7eVojPVeKYoiyHiGUiLI0JcxHXjIVFehsVjAxEIjJtJwjqORG+tHGM1V0mgq6kLGxxHjuaqbFBUwrqGRkkGNAZ0zJUNORplJDyGKeW77sbNcJhtRdNTYiNinAYcMp6lZgjIxRgfgMUttIUdI6cY05CDgIzQjWMrqLltOi05EDwpGBYxO36zoVjas4hYcYF9GUCVqFrNFhIDjCYJSPGkyIvrjWLIyQYwsV0yIDQE9flACuJBDIYq4EYe4gULGFhriyQEwPogwLhNjLD3O+AzjDMex/QRiPPFJ3fi4LmcoMR7wwSDMFxBzdeZxDsAVUUgPWaDSlgmQyfjwuRqs4TZubwB9IoIK9SL6ULN5DXuzXX+iH6+nXhyDrgX9dma2EMOnDvSeKIOdNR2sjoj/YoemzDRYpBnwFunRp4MH7cd0OGtKUnRVKE6L4cODHIyevAfRtI7sNQirBj2xElcyI1GNNVi+FoC14GEtlq9FAz634UjWXQ0BhBX4bqY/Vw0ZGtEMYmToBGAxYhrQAg2WUC9LzS2+Us6H4r2WXvzziQNrXx49uMdLxIvE86MH1/yR4TNjB1Y9PWFAj6em9ev5dF3v6qfCPj0eHr7Mcg+PGLHMI8uPWPbRJZdY6tERw5d5bOTyyz66+gpLP7LaMss+vOaIlR9ZcYnlHhqxVN+H11zF/h7Wl/I+XwR6RYNX9JEpZokcDXkNglItgpArK8vDvGkcSR6enBl1BT+hAfomYEgHK4ArCo9lRuflo4FtprBNA3w5tlI1i7MwfXWfW6Ie84zOyVg/Dgt8J1bXOHIk3l1xhSFPDV+86ulhiw94ZonhQ59aevjwJ5dfetknlhq+5B+WW3rE48OWWOqJJZdf9on+yy/zYL5/j3sbB/V+bFL/Hs+MH1T71JghPZ76fnAPhjVPfr9YzZOjB9c+8/3gmmemLd//8SmL174/muPwajOoCjKgr4O2Dhu4tTqZDwBTrISGIERDqRGgdx+arcIPgt5YN1OLjbI98MNcDTZuCjdi3sbZamwY1GCjTFWroepsENRiHa8GawU9sE5tX6xW0xv9yF/fCOgT+6DPhc8HBAjGTIL0QPwKvESRfhZtBrxFe/jdc/Qc1Vzd26pEs0BTCboNttKhTIemEhoPY762/Fbqtxj2XHs9/OqHm+OQ9TbDIetvgl9tsFkTNsWvNmR8w3J4+EY/wuEbbU60Fv4IR2yyOQ7+4WbYbe21sfKAQajiO6qokAe4CvOohwlGc+6HKNGJhdRnWmMDvJoaLLP5pldtftElB2131W9+uf3ll/xyp8suOWin31xy8M6XXHDwTpdcdPD2F59z8I8vP/fgHS+86ODDL7/40JuffPywJ155/dCXX37tkJeef/XQN9957ZAXXn3m0FdfeubQ1157UfmHPvXE04e/+eafj7jr1ltPG9Crz3cx3wtZibcJt98QenxF5iMIffh0NkZr6scluu4SGeL6wCLEUpiMeoiZH7kVlrJi1TCuKQWvAI91mMWzz5p0hjTYPuWCTt0oV2WC/nh6ieGLf/fI/Xed9uprLx/6tzf+fvCrr79x8Isvv3DIO6+/dMjLL/zx4FdffPGQV95+/ZDnX3350Mf/+MKhN9919xE/veayw7c4/6xDtrv44oO3/82FxDkHb3/FuYds/5tRh2x/6SUHb33xBcTFB29+/qWHrrrDjy9pzHmlxmIjaZduMbQSy2azCKqyQM5DGHAOohJqOBcjFx+G3ddZFwdtvCkO2eiHOGyDTXHohj/EoetvgkM22HiG8KD1NsTB626MWYUHrbcxfrHeD/GzdTbCwetvil9u+CNst+qaWMavJgtAESE5FAtoDqdHUP5YOUjPiy4D3qI79HTkYkDGVZAtkLEVaFkBZbKCnnZlSvKM58IQK9BQr9gwDavzhfxK3FpauQiszNWKsFLBkGD5AiCM4HubSihPGMF2I/geZlk6pKXydViO8vs05JHl+y/QiNN3MAcI6NSyFnMrsQCfqxqvVEIGAepUb/El3rP1Rn5uK6/8pa266v9stdW+spEjv7a11vrW1lnnO1t33e/L4arf2+qrT+y9yioThg0bNl4EHVySAAAQAElEQVQYusLQcb2GCiuM6zVspfG9hw+f0Ht47wnDVxk+odfQFcbl+g/4wgI/H5MY833APMSE5wXwqU9EE+t5zKYz86IsKfNdeWwRjNuEQVxArhQhQ8fnczxgfkT9S34JIWWC78aiOIci5clHgnXMoUx9yY+hlZzvZ+CHQWnAwGHfDxy48ncDl1r5uyWWWPHbpZZa6rtBSy/9/ZDllhuz2IgRY4cMGTJmmWWWGS1onDZixBSOfZzjYlXyIKxMThSuttpoly+eRo4cU9930DcFUEOuuqKghCgTolDKc/FjCDnHfgSgVJQvg1+Yhh7FBixerMfwuqlYYloDlqgrY8n6RizFORSWbixAWLZQQiWW4ZbxdOSxFFd2Iyh7pYYGLMv3nctXZ3kNNJBPoJHd5uEhJBiF6ZqULgrJFRxUMvfgjrHYn/sGac1OzwBvw06vY6pgezJQcUvrYvBoMMyZEHbaVJbYjQxXHT34wqhvvgF9G/PozRVTr3wes0JvlbdAH24VJvm9WCb0ZF4vGrYehRjVxZBOC3QCfhM8agO3mgE/McEUYjMULAP49Agurx1OVjSacwqOaSsjhF5MhIByLUTEUHnSBVxFxRYgRoDkI8NPP8QVm9EJ+QANbmRgOyCmM4ygPJ/piIg5TuZwlWkE6PBCr4TQY7981xRFkcHoDdE+n1KUZS++ph8h+2ZvMOrrET5XoB51dYXs3ohsFNGRhbwGiujN+dO89skXMK9hL7UtFNGnUEA/om+xiB58SMmxj1BQp+5JQRGQI8DAT0w0H+Wy5mQaWeQYSK+ARW7KF2zAfJJtFqB4S+g/YxRa5qtRy7w4Nj7tewQdQOTBuKqBHEHMNMOICGlAI5quyIUBSuajyNVJ3qe1pWWX3PZBifaSbozOJJbD8hvpVAqIvCIiv4AStze1sgqdc6MGNPigM3OIMoiQRdyEiOMw5nkE3DcZOT46Mg6fhrnEkTVyhEXAhBKAEBpabCHKfXA5mtHSE+3yMfPrEOsXF+WEAz40+FxBBoTH92M+HbFPz+tzPALrcH7k3ASLY8w8r9PzMIePmcHMZl0rnnV2mpsyUMmAV5lI4ykD7cWADN2sZXs0mgENZeBC0BnIuEesLBsW0nSCpt5nhlYGpkzWCWFxMWw/ww4EsUcD7bE/ow4uDiphBHWTLqAeMVhqtPF0Sszm4RE6tMIq1wX1L6M8xohuK2aexqmaFqs0Yk4ZUB9JISvESlvRGG2XIwg9Lr4sijUG9uv0icE58RBEDBkHxypEdMgxofEb5u0zq2tAeYIkKXRgQl0ySI+UgVYZUGFyxymeImVglgzwuXqmfBmbykwZHaEyT3Ezg1kZSkcGCIrLQfhcgclQJjAKkeyIjkNgbWfcM3QoOfqsbBQjy+2sqjCyTIneQILaA3EmDrhqCqRfaDTmBHf0aPARhFkiB48rq4jahU3GX2pYTKvPFVSsFZxWbVZA7BVgiGCxaggeQm4/RnQGxlWNR6ACpi08pj2F6l/tqI9atgdKnAQO0dkCnXz253McPrePXRgBHvOMnTOg7nBQnFmtHprLBK1WXIiF1EdDWYg9pl21JwO6ZttTfiq7GzHAm3+eR2NmMCujZWM5M60yhHIZ3ZYXIaQDCBlGDGX5Pa5E5MQCGlWPxjVACIvUuuiX27XDOS5FRsV8OhFnwOlE2WlzR9a0Miln0MpbCBjNukNTGhoP8xnS7MNQYhWWuTTLjLkC70KNxoFOMaZTlHyPfajbiHoAEYWjXT6cV8rm4fQCYo7BzQFfOdLBQXMRU8/mzjkfUROa8+YzYmYwM9fazFzcmBIYtPlh/LS50FRghzLA26dD+08774IM0Og1ay3TJzRntIhEtEaCtgUVoqI8piEscAmWD0K+Yyo5FGg4Q6YjvnOCJ4NfolkvcSUkhC6u90VeXDLExfa7fmN6SoAvqagwjbp0Db2QBp16Uq8SERHSBcZqXHGZnBQB5wwiOoMy6LkAjhUSyboexRrrR0ZZHG/Bj1AMSg4R0xGAGCROqzE6Mg/05lFcYnb7HNYQwUolPTREFiJkd42ZEHXZMhQPOfaY+qoONEaOI1Yojagj5geczZheWpCYmUAKZspLM1IGWjDQfkagRUdpctFkQAZKmNXolR/R4Ic02XFM40kjL0dX9DyUn/wZ0sgZDaTFZQkq59YXDW2EUsz9vnJ2259pzS3264yKGLf11C+j7BdERADK0yrNp27On3GVyNyyLu5LHgFARxTTIcVyYoSB/oLwYsDn2FRZZRHLFI9o2EEY2xmH51sWBr+ALIH2+Rh5ZP9BzH49cg3CHACLy/A4eOWBH41b8+UlTox583voGkgQRVH5SyKJMPadRNMwZWB2DKRObHbMpPkzMaCdmAQzFc5HhmTlPG4ONhaQ8wO+4PJR5K6ZH1Q54290Hgh9eHEWcRTA86tQ8n2UshlMzDfCfD8zH93OXZNidT7wq6dFoRxRFp7lEPM9VmgeyqCKNOxRwVAVV8Gnfj58xCW6Asui3C6HEt+bwenPUi8Djw7auKaq9nLwSx5XmGBbcIxcb7F9BlnmEaUc119ZRHm2C2qmIAwb0U4fP5utqS+EQZCtodPygboIfVCN3sWMQ1UDUBVmkEEVIo7TOGc+dfU4Fizgx8zKnDA0M5gRaPpYU7jgQbMEOsx2kNosPo10AANeB/SZdpky0MSAh1IpRHV1DSI/i3ovE483r/i/UrHwnXmN33l+49hcVePXnjX+z+LGr4gvPYaIGhv79mloqK2leW0S1daBX9tQHdZOq4oG0rAPRi4ailqiF9EnXgy9sRh6MOwRLAWvOACZUg86Hxr5UGOil4JH4xzQ1Ps0zD7gGYoh80s+sqCzKPZCtUcZ4RD0DIeipjQEVUX2UxyIqtJiqAoXQ004ELXBEK7DqutQzBTQTp9pYRhNzWXrvyavo3O5/Pjqqvx3hvwXjYX8N6WwMMbzC9/CCl9HpcKEwC/UBUFY5CrJp1NvJ5VSsSkDc81A6sTmmqq04twwoK2mSsyuDRcx5aI44BuiDMY0FgvhkEGP9F1/3ctzG6x7ia231gWl9dc+r0hEG6xznm24znnxBmud522w9vm2zmrn91h7zbOn5Xp/UBbSDufxwP/+Msaf+F4D8n8voOFvEab9NXao+5uH/F8IhvX/MIx9L4/J3wCG3shmauFztej7BrOYCAFuu/ncrGOETq0acX0txnzQgAmS+14Gjf/wUfiH1wR6j39EzCtg2v/lMfrdMfj6799Vob5XoPbtgd79lnx/0EYbnFVafZULJq66woUTf7DqhY3rr3WRbbXRxcVN1r64+MMfXNK4wVqXltZb85LMD9a4pH7Q4IenhnHJ49xxiO2hUiozZWCuGei0TmyuR5BW7LoM8L1LNshRfxpxPzNlxU02On3lmy8/dePrfnvWZtdfcf7m119x4cbEejdddeHat1xz4Q+IjW648oKtrrvygh2uuPQ3i/1kk7Fs3D5HQ9H/9N2vq9577mP865n/4f1nvsYHT3+Dfz/9Nf77lPA//Psp4oVv8f4r3+B/H05COA2I6Z3DMAQXMCjk6+BZiBgFMAcsooOrQdxYg//9cyI+emMM/vXst/j3M6Mp/zu8T9n/Yj/vP/slPhCe+wz/feVzfPLu/6ownku49hkpem253vitr7j4si1+f835W99x/bmb33b9uWvfdPk5P7jhylEb3njt2RvfcPVZP7z5il9vfOuVZ61xy2/PWnqj9S+PslUNxTACN0/bSatUbMrA3DGQOrG54ymtNQcGktXXHKpBhlxQPeMpzhcR0xjWlwphY3Vtu22Zsat5O/z+FtT1yPULl8CA0jIYWBiBwfkVMLhheQyuX9phUMPS6DF1KIIp/ZDJ94Tv9UAmk0WQ8ZAjqqsyME+GvohiVE/k6eV8BHEP+HW9kJ0yAH0bl0a/hmXKKCyNAZQ5gHmD8kujf34J1EwdgGByVQ3QY970b8fa31tjYXJY8C0TtGMv7SPa+GkfyanUjmIgdWIdxXzaLxmIHDI0hmFg3qTiVGNGBx4VXfu+5axnxsvXwsv3gDUKtbB8jYPfWAU/n0V1sRZ8dwa/RINeiFHMF1AoFFAsxoiYjkraUjRw0QnPB+IS/TRfjVXHVejl9QEas7DGali+CkFjLQL2J/jsL8N03+xAvo/rCYQ1cYV2HRrN5aoKkY9SgWOJTHPYoerMT+ed5zqbH+3TNjMw4M2QShNdngHTi5hOOAqtvoRK1Vw6Q8MflFD0Q7NSqfMYlzCMG0phFAUBQqLElVUxa8hnQ6KAhqpG5hfg0ZBzgxBVHlX3Y+g/lvSDLALkYGBJWMUtRb4HYyrIBvRicmJ1dHp5hNxujDNF952NmHLDTAkx+/B8H+Z7hI8CnWEx4p5kJXEdHI/Jjc9XYj5XmV4H65J2nzKQXoOL+jUw0/O9nqx5WShfqOBHW4blpCHyQm4NhjTNrG8EC+SUpqOcx2weHoyyylB+BCYRs13MzGKxARQUWC7nobN8aKiDrAdpypEyDPleK4RWHvoFiwSluAQuIuEbnViJdSIggocSx6a6XuADXIbFhQg+CTQvBhsgl8nAZzQOi4jiIsKYbeMIpbiAIkooRSGKYUzePGSDbBYZerVOwk0YRmHJ4tgLMm6sUst44lUBcNxCOY0ZP01l4oVUcP5JjfIoRRVFjUKhuT05UTpBrIgKFTqQcKUTuLyKE/N1TTbnsHpzvJNEUjUWjAFvwZqnrbsKA2YGs+nwYNDiwQDGAA/lj+5x3+O7HCsbXxlglch4hDS2nhcgjmMYV1AFNMCjyQ1YwfMYK0UIowg+Vy0RDVNMA2W0Vn7kQWBL+GqLmA4hpqFmw0KJqxiWRFFQ9D2fOZ3jKFT5pbiYBcfh05BmOK5sGIELJvjcS0OURWjU2w/QSOeVCaqAUoAStwq9wODXRsj7k1gtz3pF9M72RjgtQkw+OHxMm1J0X7XPxgGysQ8/znIeMlB/kZUAn4efIb8BLPY8WL2xsHMcfb1Co/nFaSG1NacfAvIT0BEbQo4jhM8LyZPz5pQqx8QjvVTERWXolaCfsyoxHjE/wxWqtmCN15wDR8nhw6MMQwyPI/dJSAQPMML3wKqMRwSgbLhKXpJAwH6ZAAwggYQ7ECD9dDcGNOvdbUzpeFowYKY7uUVmUzIpojmgOYFMBp1LBD5nswZNCSvoIpEEL4ppSnx4cYblBo8WQg5Nv7QQxUxnAni0tyVacosBLjF4Kq9mGGGbmG0ito9gZpRlqM1VA9wysyiG+Z1oOxH8GNUlKxZHTmc5Mz/y4BGg9jGLQz+mQS6hGBWBjIcMV1jFYhF1dVPp0IuQcS7lS9w6LKHKzwE05GyKbHUN28TOvnpQtgdjSBqhzBjlj0dHYDEbiehyVoefs3mLAvMtm61BSIUjxG5upWJMR5boLkXp9+H5PgLzOM8hr4kSWYthBsL4Yq2IMKTT8zK87mLweYBukGUAeCnxXD5MpLElQqDKZAAAEABJREFUcwFy4kUuxjjKoA6gI6VQZgBcLDJqLo6mQAmLqbAiKboNA7yyus1YFt5AulBPZhV3MPW2GLKR0Cfm3R3zfU8c+IAXEFnAeElYOe37Wdb1aDoMLOWKIYNMmOX7nAB+wUfOamCWQRjTaNAQZWiIDLQpxRAZyvHN6AKYpryY6ViSmOcRAY2ODFupgdtpfE3kR14pE2VCNu8ch1/HodBazkEbuikULI9CPBXwG+FZEVXcZquxHuibGYRa64Navxf8CCA9XLXVob40zbWpL9WjK5pUK5Usy6WY1xA6nxwaEPqG2DNERMhLqESEnPMoNufgeIIfAzlkkIl9BHxwCVixio4wY1UIMjVsm0NIkorwkCfvfCwgP4Yo9pxj82AwygvYoVavWcrLsp67yMivomamwMGsKc56LoOnpmqMpUd3YcDrLgNJx1FmgE/DTXduOT27s5nBzBCXSuCjMGI+xcYR484iMOS7njDKI6b50EXiU1BAAxPTiMQ0QigF8OnanHPyPSif1gYePVqWdbIW0OCwJbd1IvYTMk91+KBOJ2jIlAwyRhENVlVtT2SCKt+L6FHZT6c5Ylpk6jdbfSyCVl5B4MEnwBVbQ0MDolIMPwoQ1rMlnb3iEFdhTIp8mOeTV0N1dS0rdL2jd9g7zPrZ0Pey8Nw/3zkzMB5rnLwyIi9Dh+TDshlm+0BkLGU9lvGSgq6DQNcRnVlDXSOKfPAhffD9jNwcpaD8MQYWgxcrOUPTJ2I8grl/KNc1FrEaz+zHCPD6Q/pZBBjwFoExpkOcDQN6Mq7i03IVb/4cImQtgu+FoJch+BzslxhGKNFkMBclbpkVohAx3wPFbKcvHhTNENMog6sP+kH4sUczZfCLNDJs7pkPyNj5WfiWdau5HA18dckHV16IuMXWQN81tRR6BV9OA53wM+vbxCIPVogQNUbwIr4T82rhBzUwGnA/IKMRbXcUc6XqcUxZbi0GLO9NA9sb+Wksy8c0tCpj8ZyPTlOjMShYHTwreAGy/FcbZpDjO70st5kzdEEeV1awABHnvb5Q5PXjkRM69VKEfLEgXw+Pzsp4bdRkq5FjvSyvn1wmA4Ql+PRyHkdr5M9VRhGRFRB5vBL9Ikq8RhtZp8jrktWguoGZoqwewfOU4/GBgQJilz39pKLpqTTWDRhIp7QbTGJrQzAr39yzqhPw0beGnqcvCwcQ/XnD9+dqYRCdz4AmDAmBwSzrR/TmCw7LNyDwIgQZHxHbClz9IeP5UGjG/mic6vheKKqpir8O86XP0Vj8JM4XP0Gh+ImVip/wufuTuKi80md+WPyEe4pjM1ZXn/WnsZvOcYS1ZKPJSs5SIxpI5gdBllz0ps0ewhXYUISZlTE1WglTwhVRH6yCOqyIafEKmBKtiEnF5dAYLoe6/AC26YuYTh3OBFNQa4chRrGq3GFr9RZS2UQ/sG/9KPrCiqVPw8bSJ1GeYaH0cVQofRoVS59zzhV+ETaUxme90mSL4kbPoIV2DIOXCaAVbKFURDEs0EEVEUYFFBumomHM98jS7fVB+bobFAEDiUF8GBhI9OX12JvpgSzXddvbgIBxdgGyxFgEM2Yy5hEuL1akXMxLtlxYzkrP3YABN8/dYBzpEFowwN07oOl2NWuKYPpHE1/N5IZ9B2LbvoOxS7/FsWuvQdiL2L/vEPys/1Ac0H8w9h40BHsNXAw79+yL9fsOQJ+wyNUHHRmfjn0LaXAA41YQXRjgVmke8rQqk7OGeOnF/m/o9ptf3X+nLa7ss9tWl9XuueVlub23uiKzzzaXB/tuc2XVXttcWbPjj67ss+0Pr1xq162v7Lv0ypPRiT4x3XJr6ojjfBihZL3xz09i3Hz/Z7jxocn43X3TcPm9k3H1g4245pE8rvtDATc8UsAdTxVx1xPj8PiL39LJ1SLiaqTJvrbWTacryyw7tH7JHTa7ps+2G/+u555bX129N+dxz22u7rnHNtf03n3ra/rutvU1g3be4uqhO2x+zbI7bvW7aPjgv030yFPOh1VlId5i8qYvgeS9AqJcDAsKqAkiDM0F2HrgEth36BL4xRLL4qDFl8XBiy2Hgwcvi0MclmF8SfxysaWx/zIrYASvS15usHg6TZI78xU/vTyNzQMDXaCqbFkXUDNVsT0YyFLopiuujJ1WHYm91vwB9l9zPey36lrYf5U18dOVR2K/FUdizxVWw14j18Jua6yD9ZZcEj1943qqHoWYxscHfN9DYutDruz4zh0h65SyGdQMH/rQ0hePOnHNc3998jqjzjxt3bNGnbb2WeedstbZ55669qhRJ699zlkn/eD8USdvSGx+9hkX9f/J+lPQ6T4c32x1MnBZgUx1f3z4ZYhbnnoPNz74IW7+w5e4+fH/4eYnv8QNf/jMxW987H+49Q9f4Kb738dDz/wbk+p8xNxijWfxgDFTdzEfR/zO8xX7FXbYYdwW548a9YMLzjpurXNOP2HNc848afXzRp2w+rnnHr/mKGHU8aufd9YJK1949vFLnHP6cQNXWfGeadz+a7QIUcZDA7cU9Q3WXC7DVViI2OMqrNgIKzViIFdpGyyxJLZccjlsOWQ4th26FLZdbMlyyPg2iw/HNkOXxNaLL4VNl1wWS/TpW36QImm6FBlAOwIKreUq14AI6ae7MdDaHdrdxrrIjkdbfryz3dOqmcGsDL6BQHZaPQbCUDtpMvpMrUP/+kb0nVKH3pOnoh/L+vCle9XEKaipr0eQb3QOzKp9FPyQiJCPSgiyPt91NLqwxPdmfHNBJ8fyjD/JzOIuSXwvkJVE98rbJELlJ458FKMc8ugPeMthWjAME/2hmJxZHGO9AZiUHYDR6Ifx/mIYFy+OKRiOvA1BPu6BEt8fGnzM6iNDLKjMM/bveaZ4V0SdcY/R82BewO3DIq+TgKuxiOPnleLFbls64Ata4/uwqjBEL74769dYxJBijIF8tzqE24iDSiEG8CFpMGUM8IA+rN+fD0o5EmJNiDQ1TESYfsl5nEWXZL6iKLsxpdgqPboDA153GEQ6hukMxHE8/Q6enj1DTMZRkPnM0Tj0LESoIWqLJQg1pRKqCyFy3CasYjzHrZ9cCdAf/CaCoqaIOkviEU2DEDOM4dFv+oWmal004NJhlppHzNXIGeiI+RbHcsijGo1eL6I30Qt59EKj9ULeeqDe78W8PsijDwroiRA0v7EP8YU5fYzm1y1551Sxc5bnzcuE9CQmyuiQXNikqhd7SQz0Z/AjIEtvVEVHVs1rrwevSV2PDk3xKlcWIctrV19KCijBJ5IjNrC3JMVQ/TLQQfEKUnQjBpIrqBsNaREfimaUN3HCgpxVc5y3ttHHqYryVE3OSaCVga+9QFrVkDYz5JNzqQkRHZKMjRcFMIHGNxv6CAijIGc0rGweFKcIlA1V0hMrdbWjrk5ryHhOapMRGl6NXYjpuBnysCjD/Ay8KEsRAa2qB9EbclUVm0EG2xC5EHP8sEGxWGmn59iiM1XgeONMCF4vMTkB9EfjiEN4vFA8fcOTHMXg1iJXpazruBI/uuaMTi6B0rpGs6GHXMmDk8lr1QN4JgxwEZQ/xoTKyqkZzvEMqTTRpRmYzRx36TGlyrfCAM0shFlVMTPERhvCQneX04CADkyQsfFpcBQH843OzGfosYG5yuVLiXaJrQGTsQatNLruR0NrTXvTAwG3uGARIguhn1MSQEJkcBHTecEgUiMvYjnrMSwhZv2I59aktyjr5CuxFtrOkPRjM4/XiM8R+wzJCN2VOXjcjjU+FEW8zuTgFeoainj9gJ+Y0BGrESOklk4QsFAO0WPcKAfuE7kzT5wXnhHzn8JmSEb5Mm3OSiNdn4F0Srv+HM4wgjimJ2KOme5Y2s84MQOA8R+aPjIGKikF5r5NyAdbCBFfvcQ0ICYHxbp+REMhKM0GscHV48MwmKS9ZjnLJI/Vmw9ntCIKa87pYpGwNo7iON+a1uIiIh+hF0F/w1T0Cgh9NuEuqn7kVm3FUeSFgFdEiWWFoIQSydFvB0YkTe1Vr1VY3ICQe7qtVuq8hTQyfOQxOhzSwGuQMZj5cCleOx6heExHFvHaE8SbVq5FPyJfZYjn2Nis6VDUtD3ZlHaBy3Sx5pOy4E7KinRK0Y0Y4PXVjUaTDmVGBpoc2YyZ01O6ryPjTa2rgIZV8Zjp5pBVZWQ9RPC44nD1mSdDonqMgjaG8JwzA42QmcGMkIszuTrV6sLQYGejPn0QefE4/qaHBXEHOiyNvamNuVAcR8yNCbKpTBLrtSLbNUtOsWXhdd0HAjPnsbhi0sDJFQNeUYiZLQcmHt1QyR94rQnu+mJaoZyXoOtSCMUxyyKFvC5j15gnykUTyDgz0qN7M1AenVcO0nN3ZYAGxA3NeHcrrtBl8KTJ9/gS3aIiEBMoIRYshH5hvGRFhF6JoEmg0eAaDDHTsBJ8vtPQuw0/8qCfDwpoorxma4LyJ3YWqRzvaudMg7yGXmjNVnOjE8rQT2fCgO9nAr7z8eFzzQHm++RCfCROHuTJtHXG94iZMMP6rMulhurMtoPpBf70aNeLlcCnG6odIkZshojXYsmjMwdJsoiFrAEhApgWTA5qBkSQQ4t57QkR6ykNfjwiJigWDpo5zPpjxoazLkpzuygDmv8uqnqq9qwYoG2YKZs3bnMezYSLx+YCGJ9kPUIGIbQYtKs0JzFKtK60u+VKNDsh7/3QXS1lCRHbJwjNQ0zrYdwW8mnEPSLkUzbzMk0Cul4QVQUhvFyRhJYI0NRqfArLMMRu3EDMMgc5KcKRiIirtAgkGO7D92Me+cmGQNCUzYDFnisWv5FRFucgdlzyfRrbhMhQvpW68nZiDEQFM5QsQIljixx0jYFURYjEoxu7o8KdYqYVUSiEpElojpMVXatF36CvwKo6qwARW7GSsRwOyZn5POKYijBMj+7DgJv37jOcRXskcRwHDXUNWYNFtIU0rdZMSMyoAD6lmucj5r1cYqmZIUSMbI8eKNBYh9kAXlUOkc9Lwwu4vjJ4NDohjUWJiNhWCFle8n0UWF+/0FGkIzSwfjELL6xGbLVAtroGM366TipT9MNMJshnMihlqmB+Fd1JFlp1+mSFGSiRr2l819WQjREFPqLYR8xVGSwDz49ZXqBNLRI043TqRgmZsMjXY42I+S4yJIw8+uQxyoD9gPkePPKeiXNkswah1VBcjSHiy5+uw94MmnJE5DGHaR558TgePuT42QwKXP0XyZuuo4hlMXkTFI+8LEI/ixJZEGKlGW+MSIXq+QEaI2AK+SuwN0aR5QOCT2SYNsTuH3wmdKhCbAiLXAajOVclKbo4A14X1z9Vf0YG6Mdi8zzPosgZvUgZhMIo+ZSiMBIagHBC4BW+Mit+bih8EXj5r4JM/ks/yP+P4Te04d8GQV7h14x/la2IZ7L5L3NB/vNcnP88G+e/qvLy3+W8/PfEGNYbnbHC/xrqtUc5o4ZdJRX0qx9rmfpx1T0xuqY3vq/tg1Fa2PMAABAASURBVG+Ib2sY1vTDVzV9id4Y038gvquuxqRsNcKqHhxdFvRa0MqW3pzm0kMM3WYZZvsIqmrh9e6DCTU9MLZXP4ztPRBjew7AGIbjevfHuF4DMb4XQ6bHMz6a/YwOsiX08ksU3iWPaYD3dVwqfONbcXTWL3wWFgofFaYWv86g+JmFxU+8sPgF4uLnXqTrsPgF97e/ABiPip9FUfHTuMQwLH7O8PM4KnyGEuNR8cuoUPh62pSirmMSExmZ93lNe1FEV4ZQPqsUxnwWoWuLEYJ3Qb4hz2p8KmOD9OgeDOju6h4jSUchBuIf/vCHfz/11FNvJ+749a9/fftZZ511+9lnn63wNoa3Mv17gWW3HHfq6Teuvt9+ly229x6/HbzXbhcP23fPixi/cLG99rho6D7CnhcO2Wv3CwfvvccFi+29e2X8fKbPH7z3rucP2XfnCwbuu90Fg/bfUeF5A/b88XlD9/zxRUvsvMXFg9cf+Wcp1RUxsao2fPP7ifUPfPQl7vjsG9z8+fe44X+jce1X43Ht1+Nx/deTcMNXE3DzZ9/hno/+hz+PnoTxXGGUuEpA7PEwRLKoFsGZTM9DFBkmccn1USHGw59/g1s++Q43fjoGN3w2Ebd8PA43E7d8Oho3fca8L77FjZ99ifu+/Q7PfDO6YWpR6wx0yc+QdVd7bZVdtrt02A5b/nbADlv8dvE9fvzboXtu99tBu2172YBdt798wK47Xj5gt+0vH7jr9pcN3E3Y4XKFA3bf8bKh++7226H77v7bxffb7TJh2L67/kZ5Q/bZ5fJld9/p4p8fe8xvzzjttJvOPP30m88844xbzj7z9JvOPvusG3796zNuPPecUTeOGnXWDWedddYNo0aNuunMM8+8bastN3+LJHbZBwLqnh4tGEidWAtCunLSzKJtttnmyQsuuOCgiy+++OfnnHPOL88999xfNIUHMTyY6UOE884779DTLr7wiG1OO+n0NY876vRVjz787NWOO+qclY49/NwVjvvVOSudcNQ5I45n/MQjz13xhCPOG8FwBULxFY8/8nxh5eOPPn/l4447b9XjTjhv1ROOO2+54466YPnTjrtg2ZOOOGet048/e9l9dv9rV+Vzat1U7/++m1Dz2ldj8ML34/HHsRPx9LipeGb8NPxxXB2eI14cV48Xx0zFa99PxIdT8ihkqoEgB3DrkA/9dFpcEGhRwC1Ec54sQDFThXGowjtjp+HF0VPw9LdT8NS3k/HM11PwAvHHryfimW/G46nvx+Kp0WPx5Bdf4bWvvs2MDgIPXfQzYscd/7z+mSf+epWzTzp9ubNOPmOFc846Y7Vfn3366qefedpavz7t1LV+fcqpawhnnnraGmeefNoaZzDNcK3TTz5t5GknnD7ylBNOX/3k409b/eQTmT7pzDVPOen0NU454dT1jz367AN+fcbpp1900eGnX3jhYWdccMGhZ5x/4eGnn33ukaPOu+CIM88adcSoUece+etfn30kndjh559//kGbb7XV08b7pItSmao9Cwa67I0xi7GkWSkDbcdA796oN9+rq+6BSTU9MbYHt/569MV4YnLtAEypGYDJ1f0xsZbbf5nemGY5vsOpArduqQNXX9pC9LgUCwKAqzCEfPgPuaPF911xVU9MzfSE5EzgluGEnoMwjZjSYyCmUt6kngMxodcAoh/G1VRjSlXOwHeWFJweKQMpAy0Y6KROrIWWaTJloAMYKAVZ5DM51HOF1ZjNokSEQQZFOqLQAr7jClC0LGI/474hF1qMkv5cgbqGfBNG7wXjqsw5sYhOjFuLpVIB+rV/xD7DAHmu3Bqy7MPPodHLoYErtcZMFtOyVahXf9XViKuqEMXu/zej5PRIGUgZqGQgdWKVbKTxlIEKBhrpeCLfAC9mrlZXDLk9aHERQZQnisjEEQI6Nl/fmw9KYCa8wIAS6xboygjjuzCTy8uxmHV8KyJQHXC70fKANUL/c3GMIp1Vgas55rMfRoA8y1kDU6ch/aQMpAzMzIA3c1aakzKwaDJQOeqIL7X8TAD92FMk/0VHhJCOCRGMjovrKHgWIiwW4KGEEp1aqdTAKgWAjs/zfXhcXXnIMOmxVYSY9Ush6xB+XKJvLAIeHZ8XMST8CJ7nge9sXMgI8zOoylSZ55kh/aQMpAzMxIA3U06akTKQMkAG+tAh+fC4XeghAGIPgAcD33MBdEoxnVIMjyuqIp0Y/BjIssBnmbYUI9aOjY6KDkx/7cDVXKhNx4D1MhHXYEW2D4GYMFUGQgMlxQgRMzuGX2J/cYBSA+tAX99H+kkZSBlowYDXIp0mUwZSBpoZMDotOEfkRT5XYB5hrpSuCPRRiMxDTOeGZrjippPXFKp2U9QFHiJKttgA/SyKfFTkCtzJo8Okz4MWaAHLfNVxJemp+zGQjmhBGUjusgWVk7ZPGehmDEzi4iqGH4HOxGMoBIxzVcbVWMTVWcQwZog4Q2fE/Ijgygl0QjHZiCyCIF9lymC+RRkIiLOUlUOmFJTBZZiclcc6bArV180pGN+U1XJ7U/kpUgZSBmZkQPfIjDlpKmUgZcAxEFnRYCXGI66bIobTDzmmmKsv4wrNo/PyGBrfmzmoGr1Q3AQlwbqqZ7FPh5ihA8vQUckxGgI6MFZlH+WaFAPJD70YEd+jxdRhas9yWXpOGUgZmJEBb8ZkmpoLBtIqiwgDkVdE6IWI/CIiL2K8jMTJyNHoBgpCDwG3/IIwgM8VlxwSl2Z0RFEzjJU9OTDWMdY1rriEiM6NPgwsRgywD/bHPkM/RMkvoRiUUAhClqTfTiQJ6ZEyMBMDugdnykwzUgZSBsRAxJNAl2RyMRHkbNySyZRfRuyVoNKYji6iU2Ijd1gccbUlwJVHzKW/o6OSs4pQYv0S78CSzzTfranMyWc9SL6geIqUgZSB2TLAW2i2ZWlBysAizYBWV55bMRl5EJpul5hJ5vMM/U/OxSDPFVMRJT9CRMckR+TTgSUwRFAedxwRBVEZmSKiDFddGSDyPYfY1EcTJJ/v14xblZnQR8+p6bcTxXeKlIGWDDTdlS2z03TKQMoAtKqKuUySQ3F0aC0lxDDmCbHyjXkeodWaKUPwXB04GR6aV28GQPUT0MG5MoWQNNZVG/DDpKkfOjKm0iNlIGVgFgzojplFdpqVMpAyENGZlOhEYm71lRdJfDdl+gPlmH6Ht06cgcVZgCsm8D1X2Q/FjriIbUO2U6j27tc39Pdi+stphdo71F4iRUJ/UQ3KtVJZluRRioFphjEdX/rFDhKRHgubgS7RH+/ELqFnqmTKwEJnQM4DdGIOrneutpynUqhbh2Alt1piOX0NnRsjPJgNOS+BSZfvyuOYjg9lAPBisCwm6LC4BamUg4vDfUJwNehi6SllIGWgJQO8C1tmpemUgZQB/exUykLKQMpA52cgdWKdf47mScO0clsyYG0pbIFkeWadR5kFGknaOGWgbRlInVjb8plK6yYMePQaQOI45D+EyttFW4oC2ukzvS/jxqTVQQq0U1+p2JSBrsvA9Dul644h1TxloM0ZKDsx8P5YmL6D3c0wEqVd/xbWVLwkm6FOZ0ikOqQMdBwDuks6rve055SBTspAve/p3nAeZKGrqC+TVHYaw+PCsGN0qdQjjacMdEIGdKN2QrVSlVIGOpYBz+P2nb402LFqlHs3i/0G88qJ9JwykDIgBhKkN0bCRBqmDFQwEJf8bJ8+fad49GZxzLdSUcVCKI4RExXV2zxqZjAzZLNZhGEYVVen24ltTnIqsFsw4HWLUXTjQdBYZj/99NPeEydO7CN8/vnnfToCH3744YD//ve/Xfq31MeMGdNDHAqz4vAf//hHn3/+8599//7xxwP/859/LTZ1al0//Y2YmZWvMDoz6DVZOdW255ZbiE3SG+vqUFVVVfv+R58P+fLLL/vOSm/lJWP64IMP+r3yyit9mpp3uYDXe2bChAnuete4OhK676hPtsuRuIgpnDqxTj7hN9xww77bb7/9Z6utttr41VdffcJGG2004Uc/+tGEzTbbbPwPf/jD8Ztuuum8YBzrzxM233zzcexzHMPvTz755Bd4U9t8U9bBDffaa6+nV1555XHkcTw5dPyJx4033nj82muvPX6bbX88Vth0vY2+O/JXR747duzYlc043Nk4mIUxnJqePfHVV1+tsPc+e/1tjbU3GL3mWuuOXW+99cZuvOFG4zb70SZjttxyyzGbbLLJmLXWWms0r4fRHNe3xx577O8Xhm7t0QcfJPbhfLjrneNJru0JvG5bIilrk5C8uWtCIfsaT06V/vLWW289sD3GmcpsOwZSJ9Z2XLaLpCiKfK6C/K+//tr75ptv7NtvvzU+kdsXX3zhfffdd97//ve/eYH/v//9b57AJ2GffTqwbY9x48Z12V+i5Uqyipz5X331leNMnIpHjs/j078QjB492p86caL/zeefe6VSiXM6u1tkdvlsMi+HHKRb4TU1UropqsDMtKVo478fnZk4YXxmypQpAZ1r8O133/pffvlVhquFDMeT4dxkeX1kWZbjGAerbVdEoVDoyWsuqznhONw8cWw2CyRlbRLynvISsC+PnArGFW7cFXlclHT2FqXBdsWx1tfXR1z9xHo3wtC9J9F7mmQsZubyzNonDILAdaW+GxoaqhsbG4e4jC54KhaLfuV4xGMCM0OpWEQUhvBzOQQ1NY7Xjhtm+dakUYeApnmQfpoL6cXXdfD96T9JleQzzKm8K4JjramurnaD4rtANwdmC3RttypDHJnNKF95TYh7ciXcFE+DTspA+U7ppMqlagG6iWR4eXODxsnBzBw1usmTvPYKy6sR0IYGyOVyAZ9Me7nOu+CJDsuS8Uh9rnIhiEczQyabVTbCfB6lxkZ4XtmBu0x45WBhnrkqq6nu4XTkCQ7sn+PguZyU7kooTw5N1wofeMoXiAq6GPjQVsUHJU/zwneB7npvr2tbckWPwkooL8G0adOiJJ6GnZOBDrgzOycRnVUrOi/jCsKpl8lkICOVGC4aKxpar92hzmX8aVy0ndWlnZjZdPsuw59AYywWCgrA5Q2Cqir6jNbtlwxfuUH7nfN0qNLRtOLS0quiqyCYfvvqGtF10TRPVlGtS0Wpf4YrMac/r7eFcm23QlBcW1ubbie2QlBnKJp+F3QGbZp0SIMZGZDjUg5vcAgyagIdnDO0emptL6hfwczUV5bGchCNtzMyyu9KMDP3ZG9WVp/j0JhcXhyXHVbABwVwS7FEhyaOZx6fbhmPbfR/qMxcOv85Zbkw6iE0CdK86uElpjNjp025qquVGOs25SiQvnqwMSuPT3ldCXEcB9yyriE8rSqlu8bfnjCbNVdmpm1I4z1m0iNF52WgfDd0Xv1SzciAnrAZ0IaVHwp5szvjq7z2hgyI+pCBpB7ZKVOm6J2Yr7yuBrOyPRJ/ejBQiKZtwjKzIMdyTrwtwojxGOYxbSXEKLq0vnIP+MzX6OlELFaAa3AjAAAQAElEQVRkwRH77Jz9OkmSSdmMmxkXhizzDUAEzw8QR+V6yZ+qaSwshMZDo6tol8QXX3wRcPuumo7YeK0tlDGIs1l1pHwi1nU/q/I0r/MwUL4bOo8+qSYtGDBrKyvZQvA8JuXMaFgCGsn+Mjbz2LxTVNcYyKfThWNB2UBpVRUDYDb9hOpwzxY+txPL5cynC9O5GYn3aIupqVh1AVSgRV9c+YIrExaVdYzCmDVi1qRjQ/lDY+siCrWC4XZc7DK62KlHjx4ZXl+1nAMR0Sm0J6ddkstOQd5CUiJ1YguJ6K7eDW9m7rKFelLuz/cEld946DJDo0NwBsltz9ER0VjCs/ItoNdNQQZczXA4pRLC+nq3dcvUjAfbJRmJQ0zSCx469WYQ06tXL/rUGen2Pd+tzipUcXWkj5wzMbOgGaR2zgTfgWXq6upqOC+dxol1TqZSrSoZ8CoTaTxloCUDMoxJHo2LRyNTS8xoVZMKnT+Mfd8HnZnTlNtWiPguTE4t4u5dqchsmn99qcO4Eku26Zjb/sdsVnXcXoObAylI3aVIGIV6oIDHu1fjodNyDlcPGkpzBcnRqGbXAudB78QyHEencWLkkldE+/GYSl5wBngbLLiQVEL3Z0CGlE7M6MCyNO5d9rrhGNxkydhz68rF5QSMZpOvm+AHnvt6fdzY6JwHDaqrY8YKLjb9ZDZz3vTS+Y3J/wjl9jSiIN8AnZiclpmHgIpqU5FZaPkxczpNF9CyQidO+/zU19d31QekTsxs91atyxqj7j0t00dHI+qs0vScjomZGbfaYuPKIENb0yWvm8UWW2xK//79pw0aNKhu+PDhU4YOHTptqSWXmrr44otPGTiw3+QBA/pP7d+/f11Nr151iy21VD0dXkT+mwk341QITTmVZU1ZbR7IgUVRGA5dconJ1HfS4MGDJw9ZbMiU4cOGTR02bOgU6j6VedM4tmm9e/euq6mpqeO7paa/FWhzddpVoNFD04lNf9nXrr2lwrsLA13SGHUo+R3TOa1nx3Sc9CqDrRUL31tk8/l8l3xafvzxx3d54403ln7++edXeOGFF4a/+eabAx9/4o3FGB/2l3dfXfqJl55Z+qUXXl72r2//ZcRtt9684YD+/T/WuAUaWAgJHwsrrJ86FcOGDfvwnvvuWuevf3572Kuv/mX4iy8+O+z5F59f/OVXXhv+0ksvDXv66aeHvfzyy0u9/vrry7z66qvLX3/99fstLP3ash+ujH1eW53KifFBpsPvvbbkuDvKSp1Yd5zVdhiTDLluaBqZoKuuxJZddtnJK6ywwrg11ljjmxEjRkxZeumlG0eOHFK34oorTl1yydUnrrfSeuNXW2210SuvvNR3S6+43DdBJpPXuBM6nROzhWjTLEK2uhpTp07NLzd8uQlDhkjXgVOlr6AxCOuss87klVZaafzIkSP1Q8DfbrbZZl8nOnel0Mw8ObJKzruS/qmuHcNA6sQ6hvc26ZU3fZvIaU1IpUFRfMKECRlucXXJlVhr42xZVjcprC0Wi26cGrdAJw7uqbas2i7pOA7ZVey+hOJ5XtwY1HeqFUp7DJoOzONDkrcwruv20D+V2TEMpE6sY3jvMr3KoOjLBVJYvxbS0NCQ4XsxZ9yV110xedL4DJ2Wuz/EQbuOczbfTHR9cjXGcJH4hhyvM58PDvp2IofcOQ7qtEhw3znYnj8t3E06f03TVosCA1qBCBqrQr4T03Zit18VfD/mu/7FQrGq3R0YKmxk2WGJ6kUS+lLHlClTAl1niyQBnW3QXUSf1Il1kYnqSDUrjQrfz2TCMOzWKzGO1//mf18OD6OwupL39nVoXfJb8ZX0LHCc71r1x/RaAS+wrFTAosNA6sQ6+VzTcC7EbxK0Tga318CtRG35dOvr5uuvv85+++13I+jMalpnpB1KtRoTZhRtVmed5jqYUbW2S2mVX1dXlzEzmJXRdtLnSxIvgcrfRZkvGWmjdmagWxujduauE4pve5XMrFmonBiNTLffThxXKuW+/u67xTnwnJnNaFCZZv5CO8zYvxfB8xhZaL12TEf6whAdWaZjek977aoMpE6sq85cB+jNx1Lk8/ksw25taIp1dVWjv/12MTrtTjPOKOr+KwJuJ2aKxaKuL/fNTF5nHXCVp112NQZSJ9bVZmwh61tpSBRvaGio5nux2m+//bbmlVde6ZbvxoqFQm7ixKm9S6WSJXTHjETNKSba64h5SwpOftN7stiPi1U1ocvqhKf5UYnXkvf999/XfvzxxwP/+9//DuUW7rBJkyYN4kq/VxRFbvVLpzY/otM2ixgDvGMWsRF3seGG4extFw3BQhkNt3lcPwonTJgw9NJLL93xd7/73c6vvvrq+pdffvkyd955Zy11WRgm3unR3qf3/vXf3l9+9eWgMGJPnkHOK9K3CLUYEpjddkclba5DivacETcrl2Uz2WhQdc8iC7rFwYefHi+++KJ+NWXnJ5988qQHH3zwvGuvvfayM8444/CJEyf242qM26cV/0VOB47arLW/f+hAxdKumxnwmmNpJGVgNgzoyVhFXJnoj29z//znPw966aWXLn322Wdv/8Mf/vAYndjjW2211WM777zzgzvuuONdu+6666277777teedd96Waje3uOGGG365zz77/Havvfa6jOElBxxwwMXCgQceeInA+KXEb4jLfvrTn17OvCsYv5Lxq5pwNcOrmXdNgn333fea/fbb7yqGVzK8Yv/9979cYPqyfffd/7J99zngsp8fePDlP/v5z67cfd89r/rFIQdd9PijTxzJMQ/VSkArsLjsS4AkRBt+tOpyHciBSa46ERQHcrksvvr6q6WOPuGYi/b/2S8uPvDAg3/zy18efNmBHP8B++9/GcfiwHFfTlTyMQMPLPsd616bgPxcx7zryeH1ijfhWobiTjxexfiVP//5zy9nqD5+w7aX7rPPPldedtllR5e1m7szH3p+sssuu9zOef3Dbrvt9hzTLxIP33rrrZc8/vjjhz799NN783ramSuyzflOzPe8slniHMxdB2mtRZCB6UMuXy3T02ksZWAGBsy4Emna3kmMCreAev/tb39b/N133132zTff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/lTiKBrBiAZvrJmNo4xxlDWe8QnERGISMbkJUxlOE1hv2ixQz7y5Bi1Vg2do8H2rC0ulOu511XlV1XkaXBbRs1GYDn2ZQ+HChIx/oa4uDqqq9LdZXDiWSlSqxG3QksFK5EgIGRaJPFFguQP1dCHTxSbkyVljExoYNrBOAvFVx7R4ncIyB3IwmTqI90mc08ksp/+a1PDKK68ccO211x54ySWXHPHAAw+cyfm84IorrvjtVVdddcXFF1981QUXXHAl5/2SUaNGnfvWW2/9SKswtoVCynFOlrKVlSJlYIEYSJ3YAtGXNqbRdCTQ6DWHiXH65ptvqt94442fvPbaawe88MIL+z/xxBM/p8E7+I477jjy5ptvPuaGG244jobvpN/+9renPP300ztsttlmh9Cx/eQPf/jDto8//vi2zz777LYPP/zwjx999FFhm8cee8yBeVsTWwmPPPLIVglYb+smbMmwGQ899NBWwsx5j271yKOPbXn3nXdsec+992350EOPbPXgAw9u9eCDD27128sv375fv34fa1B0ADBFmqB0U7TdA62Ehgwf/vklF1686x333LnZvffeu9ntt9+62S23/n6z2+643aXvuusuhZuT2y0IhTOA49lcYNkWDBNsyTjH/FCCrciP45K8biOQ761Zx8Xvv//+bTgv2zz55JPb7Lbbboe9884729GBXXr11Vefe91115184403Hn3rrbceTP3081L7s+4BnO+DiaO58h6mbUk6w2a+xGFy7TRnLnKRdMBtwUDqxNqCxVTGDAzIoWnLSF/LHj16NLjCMmHMmDEeDZr/3Xff+dxmCujk/K+//lrbUVUffvhhbrnllvty9913/+tOO+3ksO222/6FBvMvu+yyy7vCzjvv/I7AvD/PCrvuuuvbs8Iee+zxllBZpvQee+z81q677vD2Pj/d56199tmH8V3f3nPPPYkd3t5jz93+07NnjzoZ22RwGlcSX1ihVi5VVVXT9tlz17cO3HffN/bdd883DjzwwGbsy7yf/vSnf1K41157vTkr7Lnnnm8IKiuPu8xHy7j4qeRVXHM+HOds/67SO+yww7u9evX693/+85/e3ELsz7nsRWQ1r5xrN8/jxo0zvjMTfOZn6urqTM5YYxGHgh50FC4sHtN+ui8DqRPr5HNLI6pFgNDJNQVklKgvX9+E7n2HnrSVh6ZPZTyppzq5XE71AxrDtd5///25/up2k9h2CRqL0woNjfW+thA97ig63ZVwvUXSl7E2mBaLACdXt6IAlH+IoxzPZnPg/p016sUdizrTwa1fx4PmsiU0r4J40wNNorecl+qqTGGSn4YpA/PLQPlOmd/Wi167hT5i3uyztZSdyQhIFyEhiHq7aGVeZdwV8iSjphUbo/qNwP2mTJmyhOIdjVIYR3GsV0n0YChPgfRnHoxOx8xDrP9oLC6Xzb++kt/U2v23LOW4+jLKj0shqquysPr6Be2oLLgNznReUtqSbyy2JlLjCCv+T7zKeGvtOklZp+G8k/DRKdVInVinnJbpStHIy2BMz+hmMTk7Pa1rWNx2Wp/bUNvS8OWU7kjQg9GlzIJ648qpTRWTPKHyVoy5OEvS5ZCcxG3a7QIIo/NKjfsC8Jc2bVsGyndI28pMpaUMzBMDiRPjKqya71U2nDZtWu95EtAOlXvQi7WD2PkTyVbkKHUc5GFhHynvC5vxee8vdWLzzlnaop0Y4ErMGzNmzLCGhoYOd2IRnZg2FNtpqPMklt6r06zC5knxtHLKwEJgIHViC4HktIvWGeBWGfjECzovGzduXF/GO9yJta7xwi8lJ/RlC7/ftMdFloEuM/DUiXWZqeqeitI4Q05M4DYi6MR8vvwPOsVorfw9wU6hSydUQnPXCdVKVVrEGEid2CI24Z1tuHJeiU58J6a/KdMvZeSTvA4NY3SK1U8MWKPXOXRB+kkZ6GQMeJ1Mn1SdFgxEUSRDKrQomTnZVXOSJ3q+EwMdWc73/Q7/dqLjspOsxLw4dWBuPtJTysAsGEid2CxI6UxZXKk0OzDGO5NqbaKLHJjGpXDy5MmgI+v1+eefr0Cs+Mknnyz35ZdfLsP4UoLiH3300TKffvrpiA8++GA5tsu0iRKtCJFeQitV2qVIfQqJcMabr4Mkr61C8Sg+P/7442XFM/ld4v3331/i22+/XeKzzz5bUnn//e9/l2b+iK+++mq5SZMmrca+21Mlik+PlIG5YyB1YnPHU1qrnRigJXSS9bt6+tX4f/zjHwO33nrrs1ZbbbUHVlpppYeWW265h9daa61HVl555UeWXHLJh9dZZ52HR4wY8eB66613/0MPPbSMa9yOJxr4dpTeOUSTx2HrrrvufeT14WWXXfaRFVdc8dGNN974kaWWWupR8c55eHjkyJGO91VWWeWh66677gpqblwxA2CsGx+c/3Z7eOjGtC3UoaVObKHSnXbWkgE5sQQyinRmmQkTJixDh7Z6sVhco1QqrTlx4sS18vn8Wmy7ZqFQWJP115g2bdpa3GptdyfGPjv84IZy3J5KhGE4jCvgtcn9Gp7nrUXe1ya/65DrtRsbGx3IufhfY8qUKWs0NDQsm8lkQP7bU61UdsrAXDGQOrG5oimt1F4M0ICChhM0mPrZKfdfdShNgzpDl9ls1qVpVF1Io2rffffdXP/HjK7RfJ74ND6fLduuGXVoN0fGBwbxaHxgcPxLa8WrqqpQybucFnl3dejo3P8vpropUgYWNgOV/aVOrJKNNN6hDMhoajUmQymnJmemuJTiSkyBQ2JMe/furf9jy+W19SmKZvzPEOlE2rqLTiOPK6tmHvVjzNXV8mmAHhg0D8kcSGGtwFRHcTkyhd0YHLql24mdfIJTJ9bJJ6i7qydHpdWYmTmjqbigcctxRFHkVmqKKy9ZoSmfBlY/OqjsNofnmfGYrQEzM5hZm/c7K4H6dqLxM6uytsjr2bNnlPCqFRidWvPY9FCRcK++yDn0QKF5UzpFykBHM5A6sY6egUWl/9mMU85IRYlRlDHVk36l8VQdpQUZWRlVrQi4YiipbXtATqw95M6PTL0T45jj+Wk7N23IfSxeVTd5gNA8KM1+Fbitw5qaGhe6DJ6SMkbTI2WgwxhInViHUZ92XMmAjKcMp4ypnvSVpnFtXhEorfrKkzPTVhbj7WbY1VfM3tHyRztij7lttwKLzVNXRARJtRiw2MADETMic/nMRbt9yLu2E2Nt56oTLfrEr+J6gNADg/jnuzP3f8WpPHVgYidFZ2AguYM6gy6pDp2QARksqaVQzkPxBHQiUH5rSOq2FiZy5MDUh9KqLwMqY0kjq6TrS3kyqKwXM7/oCtrhNI17iZ5fxe7lP2LXt8YJz0cUAxH/gft89Dht0LsHozyL6bDoJAEP7MLBC3wU4xA1bdDL7ETw3WKRXELvwFTH930FDoonDk1xZaquuBCUXhAkcy0ZiXzlCW0gX2IXCLzebIEEpI3bnQGv3XtIO+jSDNCKO/0V8oaGDJggA6O8OcE1buUkOZKrUNXkoJRWXHmC8pRWqL6bjF3M7cSC8tsD3jSzmMsh9Q+uhpr7cE6mKWVyNU3x+Qxiuq+kacubMWa/xYYG5Kqq0NDQ2G7GlHMYJzooFM8KxXMSr3QqcmqaI7aD+FkQSI7aqy/1KShPkHylU6QMtMZAy/umtbppWQcwwBu83YzX3A5HX7OWEZNR0WpJUFyYWxlzqicjVuGgXPVK+eTB/VCwjKoMHLe4wlwu127vxGpqenJZZO3mJN0A5+JU1bOnvtIeZjLZdhtrQ0NDSP7dlzs0z4JUE9cKBXEuaI7IPZKtR83RgkCy1V59CZLPeXXv3jTnKk+RMtAaA53OibWmbFrWMQzIeAnqXQaOBk/RNoWe7uUcZcgkWH3IoMnACYlBU7wJwd///ve9Pvroo5X081RffPHF0t99991S48aNW3z06NGDp0yZMmDSpEl9J06c2Gfs2LE9v//++1q20/5gluH0/TJ1NgtMKU7o0ad3b24qlp8h2GZ6LZtF3vTSNo01jhuHIPCDyZPrq6lDueNWemAdn8gR1WPGjOkxYcKE3pMnT+4nPsjBIHKxmDgaP378sG+//XbJDz/8cMX//ve/e9EpeeJf85zMgeY6gbpUmeporrT1aGYzrcRUrxJmM9cxm56nuppr9aO45OsbkIkOykuRMtAaA6kTa42dtMwxIMOiiJ6QZWwUCv3790evXr1aBd+3oDXoG28ql3wZM8lVXEYs6VdpGVCVq3+Bhs7uvffew3/+858/edBBBz106KGH3nfYYYfde/jhh9928skn33DiiSf+7vTTT7/67LPPvvyiiy665Kqrrjr/nHPOOZPxYy+//PJf/O53v9vpxhtv3OzWW+/a8L777lvn4YfvXf3Rpx5d9dlnn13h93fet86F513yq6+++mpZs7LBlQ50DAoWKmoHD8aEiZOWPvKYo0544O4HVv/jH/+43OOPP77Cgw/+YeX7H3105J133rkeselNN920zdVXX737pZdeevD5559/Ksd9zpVXXnnxBRdccPmoUaOuOuOMM64966yzbiQvNx999NG3kq/bjzzyyHv32GOPJ37zm98cN3XqVNPAtMoSv4prvOJdUFr5dHZulaT0rOZec5lA5T25kmwNffv2hcp1HfTo0UNinXz1pf5dRnpKGWiFgdSJtUJOWgRnULSdKAeibw2aWWGTTTZ5d5tttnlqo402enbTTTf9I9PPEy8SLxEvN0Fx5b3AOs8x71nimSaonfL+uPnmmz++xRZb/JGGbJwcF52Te7pXfwn/7NNFZdRkUAWVf/DBB5l333132bfeemuNV155Zb2nn356g4cffngrGvWdb7755r1uuOGG/a+99tqf07gfRkN9FI37yWeeeebZJ5100iU05NfR4f3+sEMPu/1nP/vlnQf+7Od3777zrvfstPOO9x16yKF33nfH7UdPmzatT9K3U6ADTnV1dYijqMebr79+4EGHHXbnT378k/t32Xm3+/bbf59799lr77sPPPDAOwg5pZuOOeaY35122mmX0GmdTud1PB3a4Zdddtkvrrjiiv3ptPf8/e9/v/M999yz3UMPPbT1E088sQX52vDf//73CK7UfM2xhqdVlvhVXBzLmSguKF/zozgdzujNNtvscV4Dj2644YZPEE8lYN7TG2ywwTNM/5Hx54gXiJeEjTfe+MWNCcaV9/y66677LPEk6z62zjrrvE0nWtTDi/pSPx0Nzr91tA5p/60zkDqx1vnpDKWaow67kRLHopA3NGho3uBKZn+uBnblk/1ONIY7Pvnkk9tffPHF2xE/IbZtguLbcUWwHevtwHAnYucm7NSUtyPb78EV0440bL/nk3tBjkqQEas0oIorL5kQ6SLI6MqwCrMyftKb+fpJJf1nmxnK1hf9+lLOUMaXLhYLI/L5xpXq6/OrRSFWLxSKa0ZxvJJXVVXLOuyiw6hn91zA0OoAABAASURBVHA/+1QsFlHdo2fPaXXTVo+BteM4WrNYyI+M43hV8rICsQwVXYIYzLxe5CnLcfsaN8sgSBjz9H7N/bxXoVBwf7TMuipy+YqoLuUo6vJUrjSdi8tTuk+fPvkf/ehHN/OBYA86wr2feeaZ3c8777xdE5x77rm78IFhZ2JHlu1AbMeHiJ8IdKzbCYxvz/zt6Wx3eu6553Yj9mL9g1ddddW/qj91lvSpeIqUgdkxIAM5u7I0v/Mw0LGWlDzo/ZS2kmhQs9ryo6Ep0qEVFQo0PoVZQXVag9qqnAarKAOagMYYMpjsGoorFLQ6YBtniCvzVaZ8QfmC2iutMkF5gvITKF8yY3oH490QZHxENPBRY4Nbhaq8I5Hw0TBtKjwq6Hu+C83zgDDkUUYyHo1PSHSuzE/yFIoXQeXqgw4PCpVWe9/3Vc2tipXmvLu4MnkdkC3Ua94ow10Dis8KSfmsrg2VqY1CYejQoSXJJtSNm2MX6bhTu953HTes7tUz74TuNaDuNhoaFXcj8SZ3RqYjxieDJiNHR4MhQ4YUaOza/O+z+H5tKuWHHK9zXhpv5ViVr7RWEzKqireE8oXK/JbpyjLFY8SuPxePgFJRf/fLlB84B8FYs/FWfKFBXpXQeB0X1CeKI+fQFTo9zJxuZuaS83ISL4LaJNwmofLUr8JKcH5ckqu4cMCAAZNdog1PlFug3EbppYemNhSdiurGDKROrAtNrm7uha2umTUbeb43ibjlN4U6NBJtevTu3XtcdXV189fIO2KsbTqgbiJM82BWdpKJY6upqSlxvsa39RBra2sLlJvnQ1LzNdfWfcyrPONnXtuk9RcuA6kTmxe+O6AujYizIAzdU/jCVkH3sPpWv3RixcGDB39NQ9OgdFti4MCBn9OJFdRfIrcynuSl4cJnQE5FvSZOTM6G8/WV8toSXOkV+b5ND0hx5aqwLfuYV1m89t39N6/t0voLj4HUiS08ruerp8SAzFfjNmjEm7hZCnUp0nh919jY2ObbiYMGDfqe79pmkNshTiwxWZZEmoefRpoY4DyVOF/jmpJtFlRVVRW50m/gNad3bm0mdwEEpRfBApC3sJqmTmxhMd2G/fAmb0NprYtSX2ble5nxAp+Uv1lsscVmcDatS5i7Uq7upvBJPGQfze/+FJ+71u1Ty6w87vaRPtdSO7xiy3ngw0zI62BKWytWX1+fp9zJZhaxj7YWn8rrpgykTqxrTGyHWlMaFedYGOb5BP4NKWt+d8V4mxx0jPV8wo8kjP0oSNFJGGjpxHzfD7kin9bW6vEaaOzfv/9oyW9r2fMpr7OsCOdT/UWjWerEOvk804DM5MAWtpFP3k/onRiN13j23+Y3N9+H5Sk/dWKd/Hrk3IMrZs2T3l21qbaUHXElNo3XvPuWapsKT4XNGwNdqHbqxDr5ZCUOhGrKcTjwZp8hrCxjfEEPJ5tCXMhtHRfSsMR0MvU9e/YczbI2P9ZZZ516ytcP7rr+2EESMtoBh1U8O8QepAziiryFohJvzzb4pfwFVdXMjVsUxGam66C42WabtflqXHrW1NTonZj+zsH1xTz1y2ChHeovgfH+c4NfaL2nHc0zA7xL5rlN2mAhMjB48OCPtttuu/t23HHHWxk6KL711lvfutNOO926ww473Lr99tvfVgGl5wi2+/0scIvydtxxR4U3M34T5d648847X8++b1xzzTUfoxNr822khM7lllvuiU033fSeLbfc8tZtttnmdsbv3Hzzze/+0Y9+9MCGG274hw022ODJ9ddf/5n11lvvBTq9V9Zee+0/Uad3R44c+d7KK6/84UorrfTFiiuu+N2IESMmLb300o3Dhw8vMoxoGN2vrtMAJ125sDJtlaZKCaU9Ay0p9J9TqkGsPBfhbcOEEUq2CegonRzTIkcxdcZ+oLSQ5ClM0nB/J8YHDOjDBw4FDtXV1eC1A3LgsOSSS2LZZZfF8ssvX1phhRWmkq9xq6222lfk8CNy+X/rrrvun4nXyO8L5PqZH/7wh4+Q93u22GKLOxm/lXNyy7bbbnsLndddyyyzzLOuk3Y49e3b9xPO+yO87m7hdXfTDjvscDOvRwfGdV0Ks7p2m/PYtvn6Z9tbBba9bU5QvSbczOv9Zo73XvL2STsMMxXZhgx4bSgrFdUODBxwwAGv3nXXXcc//vjjRz/11FMOjz322NHPPffc0QqfeOKJo5988smjnnzSQfHZ4aiKekepXQs056kvlh0jMH4M+zmObY+94oorLqCDaPMX+gltJ5100vns68jbb7/9GI756BtuuOGoSy+99MgLL7zw8HPPPfews88++9Djjz/+kCOOOOLQX/Fz8MEHH7XXXnudsOeee56y6667nvmTn/zkLBrbc2kEL6Eh/i2d3hVrrbXWLTTYHzQ2lne/uBWG5A9pE+Of9D+r0D2Sy5+0KJxFVosa85qsvBXlpFpLT5cdt3CkcmRmhoaGBgwbNuxjOvzH6JhupyO6kQ7pSj4cXErncO5uu+3269133/20fffd96QDDzzwuEMPPfQocvurU0455ZDTTjvtkAsuuOBXv/3tb48455xzjrzvvvuOuu2224656aabjnnwwQdV79zpGrRtjPq+ceONN57A6+2YRx99NLkGj9Z1yOvx6CboWhWS9Awh2zZf62yntipX/VbBukcRqn8M77VjnnnmmRPp1N5o2xGm0tqagco7pa1lp/LagAEza+jXr5++sVXP+JxQxzqzw5zaNrBtgkbGhTxD/e2WkB8yZEhdGwxptiK4apqksaqfQYMGTeOqaipXCZPpkCbQOY3+8Y9//B0d1jd07J//8pe//PCwww57j0b3zdNPP/2F884771Ea3Xuvueaam/fbb7/fHnTQQeecfPLJZ9IIH7XPPvucx63KSE5LP5+kXx+REokzU7yrgvPjVFfIrS/3R8K5XE6/DB+Tg7N+85vf7Cvnf+qppx59yCGHnExnf/bFF198BR8Kbj7rrLPuo+N66sgjj3ztF7/4xd/23nvv/+yyyy5fcMXyzSabbDJW3G+88cZThw4dWs8VXYPQv3//KausssoE12k7nDgO9TWBoa5FXX+6DgWlW2JO17TKZ3c/zCpf9QX1J6hOm38Ttx1oW6RFpk5skZ7+rj94GruYiJoQMgy55VUSaISL+s0+GmF9UUD1km9ZuoEnf7zrEl30JMcl1Tlut7WouPI4tnCJJZZo4INBozgQxId4YV3HE8OEN3GjRaeazxPSyikDHc1A6sQ6egbS/tuVAa6+7JtvvsmUSiVLOqLxdlGWubArn/ymH+qV41JcUJzbpzZmzJjmMXflMaa6pwy0xkDqxFpjJy3r8gzQYcXaQtTWod4XycALirOsO4yveQxcfbkfLda4qqurTWNuLkwjKQPdhoEZB5I6sRn5SFPdkAGtTjgsZ9Rl4Bl3v0PZHVZiXGFqOM3bpHLOctJcibn/D8wVpqeUgW7MQOrEuvHkpkODnJWcl/5TTGfU5bjkyOTYFHZ1juS0kjHIeSmdzWbdFzzSlVjCTBp2ZwZSJ9adZ7fzjK1DNWloaPBo0PXlBaeHnJdWMHJoLqMLnxLHpVDD0JgKhQI4Xjmy9J2YSEnRrRlInVi3nt50cGKgV69ezaswpWXoFcqZKezq0OorGYvei1VVVWkFGmUymfQbh119clP958hA6sTmSFFaoSszQOMeDx06tJGG3mTgmW7+KnrizLry+KR7sqrkGJV0DpvbpV7//v1depE9pQNfJBhIndgiMc3dc5B0QhmilugxYcKE3l999VW/b7/9dsBnn302+L///e/Q9957b+m33357JaZX4faaW5XI0LN+syPr6szQWTUPQWNTQtuJGuO///3vVd55553l//rXvy5LLoZ9/vnnQz7++OOB4mn8+PG9WKeGEH9VapciZaArMpA6sa44a6nOjoHLLrtsp+OPP/6Co48++tKTTjrpqlNPPfU6xn9/zDHH3MXw/uOOO+5+5t1/++23H1UsFj0ZfBl6Gu5u48RERLK61IpMcY2Rjsy78cYbjyIHD5Cj+0888cQHjjrqqHtOOeWU35OT604//fTLWXaBcPbZZ+8lOSlSBroiA53MiXVFClOdO4qB66+/fscrr7zy6GuuueZXv//97w+855579nrkkUd2fOaZZ7Z66aWXfvjqq6+u+9prr63+wQcf9Jfj0pcftKUofZWWwVe8K0PjSKBxaEwao0KuRge/9dZba7z++uvrvPDCCxs+9dRTmz/66KM7iKebb775l9dee+2x4u/BBx/cSm1TpAx0RQZSJ9YVZy3V2THQp08fj8Zah0vrJIMuIy7IaWUyGWW7v6NSmfLYQF98cHCF3eCkMWkFpvFpOEonK0+FgsqVr3LV4+oU2WzWcrmcfnFY2SlSBrocA6kT63JTliqcMMDtM1/GWM5JxllIyhQXZKhlwFVPZcoTFC8jQjlMzq19K929VksqdopQ49J4KsdIx6Sv17tf71C5HLqgeEuuuO0oB+93isGkSqQMzAcDqRObD9LSJp2GgVyiiYyzMKu0DHhlvox5ki6HEeJkLaL/10swv+K9GQut8zkw6S4HppAOXYGDHJOLzOYknoSK4tQOVJCRRrsWA+nF27XmK9W2ggE6px4VyTaMtnJb6D+tFNqwt44WRaee7WgdFr3+0xG3FQOt3K1t1UUqJ2Wg7Rl48MEH/fZzYm2vb2eWyFVcNVdmre2jdmb1U90WcQZSJ7aIXwBddfgrrLBCFZ1YTVfVvzPpTR5r33777fRvxTrTpKS6zDUDqROba6qQ1uxEDEyePLmG22C1nUilLqsKnVif+vr69IGgy87goq146sQW7fnvsqNvaGioohMLuuwAOoni+mJIsVisLRQK1Z1EpVSNlIF5YiB1YvNEV1q5szDQ2NiYKxaL3f/6XQiEcyWWIZfpduJC4Drtou0ZSI1A23OaSlwIDNDoBumXEdqGaPEoR9Y20lIpKQMLl4HUiS1cvtPe2ogBbiXqix3p9dsGfJJLr1QqNf/NXRuITEV0bQa6lPapEehS05UqmzDAlUOOK4j0+k0IWYCQTsyI8u9zLYCctGnKQEcwkBqBjmA97XOBGeB2or7YkV6/C8wk9BNVXj6fT1dibcBlKmLhM5AagYXPebv0uKgJraur68nVg98u445jQGgX4Z1PqHisr69P/1yh801NqtFcMJA6sbkgKa3S+Rig0a3me5z0+l3AqeGWrH4o2GtoaEj/TmwBuUybdwwDqRHoGN7TXheQgcbGRq3E2v7vxCpWYDLwC6hml2jO94s++ZyP36HsEsNLlezmDKROrJtPcHcdHo2ufrEjvX7bYILlxIjUibUBl6mIhc9AagQWPudpj23AALcSq7hS6pjrV/9Vy5zGEDf9nm7LcFbtkjqujO/jXFh5SoaZhJVlUWVivuLk0dcXZearcdooZWAhM9Cyu1ndFS3rpOmUgU7HQKFQyObz+Ta6fivEmA94TJtHGtZ3AAAQAElEQVRV/H9iczF8OaJKgDKUbhkqT2hNpPu/y1o6J8qTrNbazUeZx7HSgXkTJ05Mv9gxH/ylTTqeAd0ZHa9FqsEiywBXAUbo1zeyDPVfgtQy7EH0mTJlSn+Gg+rq6obW19cvITTFF6cDW5yktcE7sdncAnOz2qICsz4SmS3DptrOSTXF5zaYk+ObWzkt6kVRBN/3A24nDp46deoggZwPnjZt2hBCeQMnT57cb9KkSX3p6PqwrCehedJ8ad6SQbaQnCZTBhYOA+kFuHB4XrR74ehp+PS03+fTTz8d8e9//3urf/7zn4f8/e9/P/PPf/7zRa+//vplL7zwwtXPPvvs9Y8//vhNDz300K233XbbHffee+/tl19++R3XXXfdHVdffbXit59xxhl3nHnmmXe8+OKLO1NsGzgxSlngg6smOaYEYHpWaC5f4A7bTEAQBOD7xYB87nTqqafeIX5PPPHEOy644II7LrvsMse95uKBBx64nXNzy/3333/DH/7wh2uee+65y1599dWL3njjjXPffvvtM/7xj38c8cEHH+zJ+d3iyy+/XGXChAm9OeedZH7ajK5UUCdkIHVinXBSuotKdFC9Hn744TXpjH581113HcT4Jc8888yjdFb3M7yc4ZnPP//88XRgh7/00ksH0ZD+9OWXX96b2J2ObUdi+/fff//H77zzzpY0lpv97W9/2+yjjz7a8sMPP9xi/PjxQ/lerHNSJWdVqZnSQnNe4uSaMzosknDIVdbwv/zlLz+mI/rxv/71r23ee++9rfmQsQ0d1LZvvvnm9n/60592eO2113Z95ZVX9uZc/Yxzdhgd2TEMTyLOZPzSP/7xjzc//fTT93Je73jqqacuoOP7BR3hAWy7fIcNMO242zOQOrFuP8UdN0AavF133333v+y7777PHHDAATcefPDBhxx11FGrnnDCCf341F/Lp/7c2WefnTn//PODSy65xOeqy7vmmmu8m266ye644w7cd9994CoAdH6gUQRXAqDzA40lxo4dO2/vrNqNhsQhtQjltBI0953USTKUTuIdE2Yy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mE/jZlY2NjJCqmpWTitOw+UMo8o++uijPfbdd99rjzvuuMuOPvroSxlesuOOO16y0047XcL4b4499thL9thjj7P333//UdyaWk9tZNQSqC85Lsk1MydXBlRpGT3FzQIa2QCeeTD+UxkREzKyIcNSociFCTxMmlS/1KdfTFrrqaf+2ffBt96qHhVzz40VZnXQYTd6Qa4Us11E2TFXXwLNPuR05GPU46zazm+etWgYMZ1vLCCKvSj8DhoTc2Y+Hnww9vV3VUTN7255aKmPv/hyuHlBYwzLx/CKdIslOrOILYWYYSxpPsdlNr1XM3OOhuXuMCuXeXR2yhDfTXHjfG2y1157ncd5PfuYY465gOGFJ5544vm77rrrubvuuus5u+222zkKf/GLX5z62muv7ZTnS0bJEJpkKNrcn/KE+vp6bSca+e/rKqSnlIE5MODNoTwt7sYM0OFU0wCdQGP0NzqTfxL/2mefff6lcO+9936fDuh9xt8/6KCD3vnTn/60OR2H6Wmd7SAHo1D0mJWNndIJlP/1118PeOedd/b885//fOjbb7/9K4aHE0cwfsSbb7552FtvvfWr559//vgXXnjhJBq5FSjTyWcIGUw5Na36JEtg/wr0LUNUVVVhmWWWiddcc81o3XV/ULfpppv+fbvttrthzz13O/LAA/f90WGHHTbymGOOWeW8885Z9fBjjt5gh532OOzzL78NHnjo8TsvuuySdy8/7fq/v/zjg//xw21/+fdNtv3Z336868F/FbbZ9ZC/7rLvKe+efcllr339zZiVYQEgXyewd42PwcyHyuMyDzMXzi4nuf2ScOZ6PXr3wdjxE0ee89szX9/1gBPe2Xrng/5CHf+21U6H/X3znxz69423OugfV974y78dfdJVfznhtKv+eudtd7/82ef/W/aQQw5fZ9Soc1Y/77yzVzv55BNXPewXv1r5gJ8duAbner2f/OQnu2y22WYXrbvuuh8MGzaslOMLQHGuFViigbjmCsolNWY5GCU0/8w3ztdyf/zjH4/j/B7HOT2Soeb1aM7pccQJnN/jGR737LPPnjFu3LhVNV/JA4lkS5bZdKep+RakBx2Zsd0OP//5z9+nvv9siT333FPX6nu8Nv9yxRVX/IL6pas2EbqIYvZ3zyJKyCI27Mxzzz23wiOPPLLmQw89tBqx6oMPPriqwgceeGAV4dFH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pBM0HC/qnK/+6q9+D759yqtf/eon/cf/+B/d10/E5096xSte8TT8/wx87ffnG7lH3/iyl73s2dynb/rJn/zJb/nRH/3Rb/+BH/iB7+FePo/7+oLv+I7v+DHu8wu53z/xTd/0TS/5+q//+p/lGfgl7tMrnvKUp/zGk570pN/mWfmdr/zKr/wvT3jCE177+Mc//r9/0Rd90es+//M///U333zzG6+66qr38Xxlh/mz5nD7OmwQD2xQM7oktkFvzEYxy8xkZivm8In5VpLM85773Od+6/d///f/+7/6q7/67je/+c0/+Jd/+ZcveMMb3vDC17/+9S/60z/905f8yZ/8yc/98R//8S/90R/90Sv+23/7b7/++7//+7/52te+9lW/93u/958Jlq9+1ate9QckpP9J8PyTl7/85X/6C7/wC3/xcz/3c28mSP4NQfJN0DeCN734xS/+6xe84AV/9/znP/9tP/IjP/IPTr/3e7/3H0h87/G/OLFi2EkKsarm7r9//3YXCezJkczIX8mrKzAzWWSLLFbq856sYDuPTCKNWOyND0D3Kw3vVVzeq3r5Hui9qpf2qlrap/HSASXei/UKyb/+LnkcjhqTCCMrJ99NTKzuauoMLysqjUdH6H+/4vA+xeV7lZb3SZQ12i+N75eqQw3GjI9sisusBCsZCRJLGcikKikfZjKbQqCSG9Z3echDHnLwh3/4h//2Oc95zt84deDnv/7xH//xN/7UT/3UX3Af/P78Mffoj73Mffr/fvmXf/l//tqv/dof/tZv/dbv/c7v/M5vveY1r3nlH/zBH/wa+NU//MM/fMX/+l//6xe4/y973ete9+I///M//wmejR9505ve9EN//dd//QN/+7d/+xwS2ffwHH0nSfKbuZffRML8BpLlc83sE6yys+HrSWLIWBbuLlvWA10S27K3fn0TJ0isCPrWz86dOw887GEPO8wKq3YQdCaRdEVswxV4dzc4cuTIrBvmSWxlTmbiFZXMG4CXA7MxklBQLaWxZENJgC0+YyvRbJG6Ywnq8LYxCaZGT0RfhM/pylqgD87kjHm1F1y/62XbUA70+9ZkA/SylShv512cQEESNN6vBXS5vcEz40TjZiNmlkiGkURWsUIb8hwtsVpb/NIv/dJDPF+HuF95Sv5hIxe6S+eBk3igS2Incc7mbzrlDIyg7jHxpIJt0PctRf9TTwSZ3kk7bLDGpdGoj90zbhbzddLAVqfu+SYzKdhk2082gjWWJ7JAIjFWZ0byMd5/GXVRl2hnizDQx1dbyocnsmPAisybfERPkg7xbkwkJ6FTaTLWRJ/QmXl5jFqB5OXAPFdzSYJ7E3jv6i6SmeVfaD/FRI0+Wf4Ucl3zJeyBcAnPrZvaOfKAJzGCRQ4srMbCYDDYVIGD5FseOnSo5/PwT/dOzZgCK5sEObGbEk1R5smGUv5hcXnYnBLbjyIJmScwEpG3OxDlpF/OOJHyWmdEb8wNrvJY0JjbhG4GotzIUmjObDi91lqRRfYcG6lNd+X+MCnJ7xEfljad/Z3BF94Dqz9zF37sbsQN4AGCRQ4aJzKFd2C5CbkcWPik7H8p46R9cocNdKmrqmA7sfQ5kNCyZWZMITbR3hNSzgneQoHTSxOsJo/8S8ZZeNKUScj5xjyZTDC91ee6HJpq8/aQ+0puhlynTn742I6kkMW9LKZw8l4Xp/VsRm3vDx+WTkfNJeiJ05n+1pZtf5a2the62Z/QA560vNETgK/GPKk5nLdZwBwCK7HC7fV5kI1lRtxjJZZ5FCMFTzY5OZAoqE5Okgbt3pbFSThebhqDaJLBy8jMkK9rX2ibJDNvt1yW3BTlMWkXqxCwclrDW6nnAjzLhUvuYtZMzMzwi51yftzPUwudUksnsJk9wE/DZja/s/18e8CsiRGewBx8Qg5VVTXM8z34OdI/XFwseCeWn3WzKdO97NUMU5okEnKSUk4eNGRKV5iccmSzkr8W9LxIkstZzWWA6DPRk+VWLt62CvMEluUKcmpPSdAM/zNVK50o0Acb3J6EfER9Ho6yMhC5RE4+bMifMTMT24r4ZcXbJ5yhmX98OGFz17AFPMBPiKQtMNFuimfmAT7pikCRAwrJSx5ozkzTxeu1NKp9O5FnPaooIGIb0ZdVRsLwjJCwLScVoyA1V02OOKEQl4Moy3phvfAx15ZNjJ9IYUe3TuRtQpE5uv3Ymk3ZPGXvsWIbvM5zZpho/sw5qFM9+bkemZNr6Fo3uwcmPyWbfRqd/WfqAYJAG5rXVEF7TmAeVFygmPqzRF7fDLhi5xW8x1su6ljJwlgseFRXHuwL1jLGdmCQscQJMdBUyPCIqZbyNwShJD1NpQnlw/k16YeEaKugE62uG4L2gkSZ6igzgxHV/N5YUs37OMu/NFZJBny8DC9H5WPlSx2psSlJgYRmnkQpy8GcWLaoCAOhXMGkfj94S1axmS6+Td0+Z2aWn7vNZH9n68XxQLg4w3ajdh7QBXPB8jD6FmixNFxmTE8QJCDCfNnzLUHJFHOS0FFHlEhOyolE+SA/QCc/Mt7mgOMn6pwA+nFd1znVnwxEl2P6NgPCnz59pFYuqj83J9U1eSwphFJVNdLS8pE1e05r6cqdBy4VD0x+Ii+V6XTzONceaD8Zn2u9F1LfkQMH02AwSFVVyf8eX3/AqgUDqmWSGsuuZLWSr4agnkzSdHI5n+lgekUl/1FsgXF+er5ymhGVk2q2jTKJV9g+Wl4kiVUyM/UGfZX9nvqzsy6g7ug8sBU84D81W2Ge3RzPgQfMjE/7639kfvM3f/Nbrrrq6ndec82177z++hvfeeOND3jnDTc84J3XX/fAd7S45rob33HNddcfj2uu/8drwLXX3fD2a6+78f82uP4frr1uGg9423U3PvitN9z4WX9/4w0PfuuNNzzobQ+44aYG19/4D16+7tqb3vayn/vZX1xeXCwGvb78d49GR47Ij3J2VrFNCiQET16rdc8DjulM4nOfwBOQKzknmOhcSWSnUIqt0sQu7olmZxRTYkFWZ9zy0Y8+7oEPfsTfXv+Am/8Wv//9Dddd99brrr0BPOCtN1x701tvuO6mt11/3QP/4frrH/gP11334P87wduhEzzoH6+77mR4MHK0X3/TO67j/l133Q3Q6zKuvfbaf2pw9Tuvu+7qd9xww7Vve8UrXvHVp5jRdPNkYtOsU5bX3+eUqjqBzeYB/+nZbDZ39l4ED5id/pLk4x//+KPvuWfvI++66+5H7r5zzyPvuH33I++8Y/cjd+/e/eWOO3ff+eV37dn95XfdtQbu2f3ou8CePXc8Zs+e2x/b4M7H7dkzhd13PH737bc/4Y7b7/h/br/jzifccccdj78z4zOPv/PF9gO9AAAQAElEQVTO2x93+x2fefzuPXc8/v4D9z3MisJ8JVYUvlLZJkGrSTLz5OWYdmuOijbNWeNH5ZwksiAfxrg28DGDXwD0mDGaJEtTPkmyRVDJtmgcDrUMZua2qRzMXP6vn/zkv7nzM3f+mz277/5/9uy56wl37dmTsXvP7ifg+8fv2b37cbvvBLtvf+zuBo+BTnDHo3fvnmDPnY/efRzueEzmcf92g7t27/nyFnfvuetRjrvuuof7vvfL77hjz+MPHz78WVrHwao/u30dop1I54EVD/BTslLuClvPAylG/7MT6594jDGxJbeuYFPX9UJRFHn1ZqwcPEgHCwokxAx4SjWLCtSxktBaOJlprKIshBz+m6uPkKg7mrJ3r4ZDpdFIMcaMuqLdSqnXbCtKARuACx8HO45zLhkn1J6mR3GpiX0ktdzkLLd7mS1RF50ZNMmMOS4fPKgwmFHw5IaPI3ARvwf+TcgWyl8kwf8no/nLLRX+WQs1vqaJ/q3OFcq9JCnl/2al3+9nk92GDp0HzrUHJj8Z51rtudTX6dooHjAzhbC+R+Ytb3lLeejQoatiPVaKFWGU904Eu0hQbJGoozIHQo/JayHAPDECuhu9ST6Gw+sJzU04LUvsJZFieA6oZoVq3o1ZNJknMk8EGUY0LkCJrSS4zKOvOEgcXI8/jZXQ8dzT5LgOh8d5x3R3H9+BWdiTgDIMIcCpmRlVzId9UtV1UhVrqVcqlIXieOzTBoG5ohv5ZnZownb3q0FPhhAi/U8MKWKL0H80GNFf2eVfyRgOh0HrP9L6RcW4eW9V3bF1PXA6D9fW9VI382kPJD+mGWuVd+7cuW3fvn1XeZvJFCzIA2IT9DzwReoSGUN8aD8hTYiyuNDaNMqIYeaBmLRlKDNXycWTo6A5wJNEWYLJDAbtFgLloDT21UUBB6TpxBWwx3lQORA56owSY+psj6N0oDMnhJZOKc9J1G1vgU3OS9RrkpY7sD8jX/XW1Oe3b1e1uCgYitSdF3Fg9A8QJPvoyHXGSkwV4Dq5mmMpYu46rUWd11rpfY8CihLwdlbuONNLJ0fiOLlE19p54HgP8NNwPLPjbB0PmJEFTjFdZAj6RjCLfNqvU6/X87B30l6Li/f0R6PlORlBkiEiAZqQKaPeImUtQSZWDuD0KYmI7chEAos+BiCky/VmrFjIQKzGPKHl0Uhiqcaaoi+6SqzKZIXkiSwVpK1C4ipPEoLvZXQZlrq7zEwUGygyXsrQ5PBY7GhXrU49kUyasx/NLNOWJ/SsYpWLYglZpkbeDJInL7cX8+UryeDJV/nwMT2RLXoCK+GTwOgkYa4mh3dzZN6E7wTNmXU6dKLyKIKn1SIrpJXnwIegtK4zub98LuuSxiPrlOvELlEP+DN7iU6tm9a58IAHFNcTWQ6ZmTyBjXi/5LyT4fBhDQjcMzmZENVa6gHU0dZdR/sQni71vpgkD5ZOHTnfuCKHh06HB341R/Kkx+CJpGGUzVxAOdbnwMk8I68JkyewjMZ4b0uE50zpR/G48GlmMjP54XLMfyVRuR8dZpZlzBrqQ7j8cTDnuKecNnCdTcmvCKBDNatJErKxjXh0OzKIMJjk1P0BvIv7yGmLgkRt4HSpZcWrbsBTag8zy0UnPC9Frqzj4nOI3AOnnpBP0WV6yFOIds2XqgfCpTqxbl7nxgMeUFpNJDAvEl/SKYPH8vLy4K677plRIJj5U+agmOOeU687SCbRt7fOAIm+rSFu0bHIicZXWIEYSjQ1M5k5ErTGtAhqGYLZTEvylZabxRpPKiixajMQHBYEyTCaHO6Q3EaDmaktF6z8vGxmag8cJ/fndHLLzejyZJYQdEAk7+aNE5iZ/H+NLiY2KiRESHL0zTablF//BakwLtgjMzKMA5IakJ/lfnLq8HLNcvRMkPAbarOtSYzJUJrQxIQS4ycEqirSqFMeJDux9WjuOzPLvjpVJ/PJn0po07R3hp6JB9b1cJ2J4q7PpvEAYebkthIoiIeWQQBe13YiL/Nnh6Oqr7z1xWPmcawFKyMPbg4ZY9N8IurGJWTWorkPbWhQLuuYw3pEbpRH+Hy6j7wbSwRs8W7INCIEjwiUY2QqWRoSfqG0u4yv2CQ6eh/6JhB5CeRJiKIoZrhv2uTk25UOfKQWjJxPl3G4vCc3h5fzvPIli61eMo9LdlKNnbUSgyaSvduveqQEgnkSxu7kX6AZSazMUl4ptn2Z/4pWL7domEjhB50h0OU+ZitYeE++HetU+N0KlJYaDGaxPTObAU9y3bZtm/Abro7MlRSZ536SDqtNPo3VWlfaUh7gKdxS8+0me7QHTvnD334qTgQUD9AeeCcrsqM1HVM7PKwXjhxZCjLezayAd1A2gebo0VcK3k4xrxzWoqacoMJa1HkESw+aDv/7gTZAfoIcXCcBNRTyxFFYlIUxqFTYWL0SGkYqQr2CoJECbfIkFlAH8hdTLChgr+sxeA5x5LqZjqXicL85KOZ2l3F43RMi3WSuq8gXyQrOIHN/MFa2wQxba5UhqiySQhFlRSULlQLzyXMi+Rr3yOVD7hsk729QTzSt321G8rL8PuAb/CLGPCN43ySO4mjwIUVqeMNhpTrlAZE5+Wkc+IRpJLEi02Dyl1VO3qtr3eoe4Anf6i44q/lfCp1zGDrRRPhk7J+Oc3PBFhmflge33377rne96103vv3tb3/gW9/61ge9/W//9rPe8pa33Ez5If/4j/948z//8wce/NEPfPBLjxxe7isHUIKlPLH0lQNoIpDKQSKre0pxANamSvRJ9F2T0hZJgr4CcNSUc53xInCeB3E1j7knE1+lxMmqpY7LrBIWM6p4BEq9WlQ1XlRdLZMPWNl4IiM5NH2b1UFkaZim4D5q24nDcj85cjKR5Ly27HIu70i1mLeDzcsaGz34u97Mj8Ig5YP3XXUcq6qXVbP6UhzSz7GsVA8VM1iJQWHIIrc0OeiNPj4poAt/ZN+4j/Cb+9Prnvzbe7QWzR8E6LMWdXud7352Oo1EEvOx4e2+464v/uu/fuvn/tM//dND/u7v/u9n/93f/d1nv/Wv/uoh/sz8wz/8w4Pf+c53Psifp49//ONX8gFpzn1V17VYzTOB7uw8cHIP8JNzcoGu9ZL3ANHuxHP0T8QehF1iNBrpM5/5zENf/vKXv+wFL3jBq5/3vOf93vN/+Ide8/wf/7HXvuhFP/n7z3/+83//+7//B3//B77ve1/7P/7H//7JpaUhWYpglj/1Ezg9kXkC8w/mGSSy8jI+tF9+YpRXSCdCb5fU2yH156XBNlkL6iXlEqrAuEVPRgIue4FP+BP0kno09frQsmZFVqvsAer9QaGZmZ5m52Y16Pc0GDgGUNCHxxbZANqDktQ1Pz8v91Nkn9H/qxqHr1o9EIcQ5BCHt7e8ubk57di5U4O57RrMLkAd2zVLeXZuG3QbvBnNLMxhRz/b0+sHxsHGnia2B/WZU6809Xqmfr+ElirheRJVKKX+3ASzUm8bWJjCDqncfnL0kHEcK1egx1GitxygY4ICCkLZZ/gZlcWM/v7v/+9Tfvj/ff5/+87v+N7f/+Hn/dAf/MiPvPAPfvQnfuoPnvfcH3rtD/zAD7z2u7/7u1/z3Oc+93d/7dd+7Sfuu+++B7mfWp+pOzoPnMID4RTtXfMW94AHY189eFDJgVEavOMd7/jKD3zgA0+67bZbvuoTn/zUV3z4Yx9+/Ec+8uHH3nLLLY/51Kc+9diP3XbrE+65597rypk5W9h5jbbtvFbzO68H12n+sms1S3kWXqYL12v2JJij7WSY33Gd5rcDl9t+rRa2X58xR3lu+9Xaftn12r7ral12xdW64oordNWVu3TtVTt03dU7df3V23XDtTt1w3UNbrx+hx54w+W66cYr9KCbbtCDP+sB+rzP+7yMz33Y58nR1j+Hupcf8tCH6oE33aQrr7xyJZm5r1q476ZhZpqdnc3yD3zgA/VQ+j/kIQ/R0XhornvbZz3oJj3owQ/QAx5wlR5w/S7svUw3XLNdN1yzoBuv3a7rrwLXXMZ8oNfu0LWUr7zyCu26/Got4OsF/ND45AYt7LhWC9uvych+23G9ZrddezwWrlnhzcxfI8cAOo0+9f62q9Wbv0rl3JUZ/dkryZlXIn9FpoO5yzWz7TIdWRrNfurTn/mSz3zmM4/51Kc//aiPfvQjj7rl1lsf/clPfvpx8J7wyU9+8is+/OEPf/X73//+r8RvfU0OypNSRzoPnNgD4cRNXcsW8EAys7SeefqnY19FOGVFZocOHQJHdPDgYS0eGenQoSNaWlzW4cOHM8ZVrYotqyps18gu11CXacl2gh0a27zG2p5RhQWN+ETv9GjMqwrI2ZzGUxiGObUYa5vGcSfYpXHdYIl6gx1ajtsZd17L9QxT7Gu2N6v5maAdswZqLcyMNN+roFHbKM/1l+UY9Ibyd2UzA1YTvVIFq4qidAp6QQGU1B1WFgTtORX9nkZ1xZspthyDyRMXg+bTfeYBGV/nuvtxdtu8SvQPBgPNzIKZvmZmSvVn+2AA5jRgpTeAP+gluU0z5aLmBovaNjii7f2hFnrLWhiMtH0w1s65SnOzIxKpFPrS4lAaRXyAX5biLi2l7WBBy2lbxqjejr3bVdll+HmnanNshzoW4G3PiOUuOVJ5hRx173I54sBXwZdLvatl/WvAVUqDBnX/akX4sX+5YtimMc/B0tJQi0tHdGTxENuESzp05LAWl5d4fg7Kf68NGM9O6R+a3EnuI/ebl0+GiYydTKZru7Q9EC7t6XWzO+8e8PABLK0+SmbOEAExKPI+q9aAYDmrKMB7l8oGlPuglxNdTZCreK9yFHhXU62BOvXUIrfnvv2sZ8y2ZXVMPTF+UiGzQrwskqnmDdkQzpJ6aQnq5fGEDmUGNJbLCQs9GdVK9FqF81roLI9WT/KxWqSUk6C3uQ3G6OY2YVuh1uaGlgn7bUkWFhWgCkMsqtBUKlqfngP8NdNAlPFRneHlCdjirXPbpJ7Lvdy3mvLnWuW40ncWC/skrBnobO4bee/pepPxbFjzTEgR+6ZP2qarp19G8el36nqctgc2bIezfoI27Mw6w9blAT7JpnUJnkhoEkLMmoJZQwU1m5RP1DfzoyzFXMoXXxg6cmU9lxohYBMQJFNbtor0U9EeFeGlQDoKY3hjycasEmhP8NJq0vDEcTrQWR6nGuvE6ic/uszL5yJVzIe5+JyZp6DOk+FbZPLc4aUWyGTeZO4Rr6wgGUnUcbxfDPmM2LS5fe0cvJyBjPNyubt0HjjPHpj8JJznUTr1l64HjkmBK8GLQHb+J03YJU8mAvUqjjYo0q42KWYaFXMAb5Lb+bfxfI4Q5Ukpr248OZGQczkPSfLK9ESXSXv2SStzuuEgkOyO9neryenKs+CV8wTG8Dt8nrR3ajeDB073qd0Mc+psnHjgQhKCycpwbbmlKw1rFTyITmMtmSmeR6wWLZuFA8GcWt7SQF8qHQAAEABJREFUpJUziUebutvgYdbMWByaxPsqJPOZGDe3k3BPRM0s9zNbm2ZF5/QS0TYNqqc8Xb4RSjjD5yIF7GYLFR8of909IEDSMTW+orZymnuorTVyon8G+nIHlwGc+TOBodfLba9ME3ocuXJhLsbBSAa6c4t6wJ/YLTr1btrnwwNNAF2/Zo9BZ45CHmPlAZegKpmUywTvo8qTugsT0BMyqVmi6VRjo/C8nmc/fmCr1H+MA6siw1bKzFG8YxTzFG/7BLU8d9ooe70B4ic7vc/J2o9tMxMO1QU8GFCOCzhkN9RG84A/1RvNps6eC+iBEKaWJudgXDOTma1bkyc9/wXkVTTvWiKf6B0psnJwUHdZ8S6mRa578vKg7cHaA/cElilJLhayWMrUw6YSZaVS9Me+KSsHdZpOcQYWGecDFmvsm0ai3vggz++kdjGPPH+fU8HcHMxzMneltsxcVcrwk2V/uJwhD4RzVzAZzJOXY1J1Ykn018oRqDtWGCuFC17wSVzwQbsBN44H+CnYOMZ0lmxCD0xCiNmk0E6ButkxvLZthXqwruXB+ljAJMh6+4khElpgjMAwrEMkomog2jrMTMGRAzRNEomM4C0/SnR7+VJ4/H0OPnsoCc39aFCfJa5wlzBvTRJQpEz2ocHU0khj+36Q8kryQp8cOulhZjKz42TMbE3+cYIdo/PAWXrg1E/pWQ7Qdd/QHjCCnp2VhcRC748eJ6toV06rnDVLQaY26ZhhygqClL+aLSEi/50scaRUq18GgnItRYJvGkoOjbT655iGShE+SHGM/loR2ZgqsfJUUbBCc/vYUkxOgfNQL6+31HnkxZwInHdeYFGahpqjHdft8bnHGJlDlJlluJS3MQUvZruL0uTpLDJPXKQURxJ+MffPxBeKy3J/BVWy3IZPkBJ+xasyI73VCVoA85YMz23J7cw1v3gbsvguAeesB2Z2lN719DmZjPvlZO1d26XvgSDp0p9lN8PN6wGCnhvvgZIFhArqHrjMTH3/M0w2UqEl+e9Ilbasshhm9AK0rDQzk9Tv1fI/8Gtp1AR2Ehvd5f+1iSc1h+tvYdYEWv/zUWZN2ayhbss0zBq+2fmh7VieyDypet3tdGpmTkCUf6U+kZgchVX4oNKgF9Uraz4AVOr1xtTHlEdy34SAr/CdhbEC/cz3bUlSvnoly8gP97NTueMnK9pc7y6dBzaQB8IGsqUz5eJ4oI2EF2d0H3Wy/eXFNcEn/enA7auxwHbY7Gyh+XnT9m2mnduknQuOqJ3bknZup7zdtAPe9nlpdiayChuxChkRkyt50Df//Sl0i8P1O8wMObRXtQ7uv1/79u3LuA/q2H/ffZrGffv26qxw7z7dN42Jvn337VXG3rt1YP8++V+ycPtaiMPMcgLyuTh8xWXmyXuEX5IW8MGOBfcF/qG8sD1q+w7L/O34aNu2oG3zffUHHgai3K+JZGYytUdegbWVnMjiSk2MPlW5WEW7WAN3424MD/jTuzEs6ay4WB64OEFgZbbrfAR5/6VJEPWtQWO/bW62p8t3zuryy5wOdPnOnnbtKHX5ZY5+Ll+2vUfQLjU7a6zIkvy/LUka54DtE3ddmhy+IjNzrjQajXTvvffq05/+9FH41Kc+pQuJ3bt3a+/evfJVYSLhmjVbeG6y1x0FSSc4g8Re2FiDQdK2baV2bC+1c0dPl20vtBMfuW927SzVwn2z67Jtmp8bsFKNuLcGFVpqGasvs8YXYoWW1XeXzgMb0APNs78BDetMuiAemESpCzLWKQbxR9HhJjmmxNtgCsvMZFCXnOn1ND8oNDcwzQ7iCmb6tVoMBrUGfQFTSV8PyMRnGau/lF8oBZk1icHMclkcnhyOHDlCsmu+WOJbaw7nO+RJFXj5bKAU5UjQBs14iYTlqMbjnFB9K3E6yXqbQ8wDc5uTZMMUVBQpJ+yZmaB+v8qY6VX4p9ZsP2UMnM6IBFYgayqC8Elcmb+OOfKKzDB1AnddPEbmIlax6iKO3g19UT3Ao3tRx+8Gv/geuIgBYB1DE8wVXI7tLtUUEx4DBOyyMBnvcwrnp0phBSNZHEppKKvHCrQXJAljJWfe1QpkAzKWtw7NaInoZ6ycGCTeHZUyM/IL/Kk2b88QycYx6ZN5Z1TGTGyiqxqgtynkBgtBnjwD1MfAtHx63cwoB+RKKLbWbit+YJ4+Z3N/xErGyjP4lzx4J+i0SLVKZApg+MblkvuH1S0uVVbrCZq+Yo4o59xAKQtr2jMlT69t7ZS0E7gEPcBPwCU4q25Km8wDPIYeixwrlsOblM08WFNJiYsIsk3dYi0WHQp1IinFDOcZQTp4UE7IEow9cQVWLCH/nlRQiD2Z+g1IaARC+WFGImAMr7dJwsxktoogkwMOJa5TbWZnUpfoJs/TDrOJDkGB2+J/0d1pCzObJN8CiRIwl1iQbxoYc3X4tzcDkycNIhNFjhJVQBkdBVzVlXxL1d+HaerwsaaqxxXxuI66XcdJXDCGXbCRuoE2pAfChrSqM+qCeYBgdXZBIGGqA9KcsSFEuEAwbSqTx4zVU1NnxeABtKkcFQw9yDbsVk+UGSZ6hPcEQ6OZJ5tayvqSjOiMhBzBDFrIj4KSmamlRHnlw/u1YPViJDrn+5admRHUY8axyUN5fFZKrF4SiAD/wU5nDB/agWo19GhdZtjDVEsjWZFwQ2ioj+v2ud1eVipJUqVK6ysgm+ecvBX/KRfkA7jdzg3Owgf+tXz3X+J+8ZlANck/60PAWP25bIvVe9NyTkHRmSVWnoNc4+KDQ/IZ87W7dB44Uw9MosuZdj///boRLowHfOXhIznt9/tezPCvdnvBA7xT//+vXMbLLYKMMEmkVROQEoFQBFsRWB3ESuWvcCcPXsgQmL1vpN7EOXjOUOAakFXWaCQJMpB8Oy3WpqKcVVU1skZErdlKTGEk/yO4/jtMrj2hIwU2yizQ2zV42KbFKoWiUhHGMlvKCDZSr5RiXRP8GZcs4mMVRSE/2nkaFctzi5QcUqJ0Ts5G+URfQKVD2AcoJpJsn3d/ifmXGkiVkaxMhq19bJeN6cu8LOCqvuLYlJAR7cZ9cC/4qtRXYwU+M6TEUeOdlGrEhirYQ0yRJGizzDJw6wx+Lc89xg0yCg66cbpRJve3kIax5pnol1JiHnZMe+O/luk+bv3tPK+bNX287LxpmFnWaWaZ7d/azIXusmU9wBO5ZefeTRwPkLASRB68nfqne/9mnpfNjKRReTEHDi8Mh8Msa2YEv0JNKFE+siI118zIl2kJZ0wHsSAPhsQ7b8gwujc9XM6R2fmS8mjeh2rOjN6eqDh1SP6FA5QqgxYzAq4Ha97v1Lwfq1PFaqNmDoTxOJbP14OtoyLoux+8XMv1omBy+g+KY1JtSGNoUz7b67G6pupuj9vFqzlWfCafqdfH2G8hyfyv8rt8MJknMyvkCaAIE6PcV7nXpE6ib0oJ4tog8BJQBvXcB+onNyjfF5KZVxuwYnRmUznx9ag+02IxV3wefg9yhUsIrdHiHkWZGdwTn2VZ+iROLNC1XPIeWH1iLvmpdhNcwwOJABKdb2Y58InDzHLwMDOR5DLfP/G2AcbMMo++uviHHW+CB1cHLW5zUfQkXxkGVpjAwoxCMcMcZyQrKJOMywIZkyEXip5CCBni8CjpTnJQXT29YbV2dqUc7MNxOjAPm+CbCYNk2BmAioZXs9qpyG6egB3kG9JVyqjhH6dwhUF/2UrtYhbMTO1qzJ8zT9riCNyDtkw1n15v4Qw+cNXQc3knUNedm8kD/iRvJns7W8+xBwgIOTZDZdYENS/7MP4pmSCx8omYT73EUVZCBE4PMG3gcdmLC3+MHW5Fno4XMjzROjye14S6mArWWD020waqVKpi6RYtqKJxDCI+8FVYrrMll5VckEtr/+pgmCsWhxrHWhWViOV1lKqIvTK53bEoFANJGrvFPGKAjwqmwn2jcNTpYzhgpuZeq115wbpYpz9vNVu6Pr6Z5Q9O/mz582dmMluFP3ctzEwz/idZhGO8c4ct6YGwJWfdTbr1QCIxRZADRRtIvNHMnKzAA43/wq0HEGd6eVreeRcH/gg7pkcn0quBx2orgoxAn9RXMlZj+d3PnKKxEisHSrRFVmCyUsFXbdCalZGFAqUBrHU637FW22nwSE5yHNNlmhWwzUByu6xAHLuw01hNKgwwm3lRT0WpRLtBrcA2ELmN7gmJ+jFjbJRqYMVlZtmc9jnzBOb8zOTifIiOpYcPH26m542bHJ35Z+aBjftkn9l8ul6n54H63nvvPUTAWKZbBWoza+H1qtfrZUpAqWgb+3YPvPxpGR5dLuJJoiEDNQZ4uSmtXHMCM8uBPRLEfdU1HJqWhtLSGDoqtDwyDZnhEnQZOqxNy8OoUZUUSBxqYuuKzgteKEhYFjRm02w0ThoOk5Yr03AUtDwOOrJcaxF7l2hzu4ejpCHlmslbTsInsNjSpCFO6MUhBfPj+VtJTqyscplkFc1sjFVjyk4rKHdIXnfKTmoaXnbZZYvIXNxJYEB3XjwPdEns4vl+I4w8etWrXvX6//2///dL/uzP/uxljr/4i7942ete97qX/smf/MlL/8//+T8vc+qA9zM//uM//luDwYA8VuW/IuHB52JPIpJkogKrKmVwxaRI4mrimq8Wq6rW8qjWwYPL2rv/kO7ed1h37z2ie+5d1N33Qvct6h6wd9+S9sK/6+4D2r//iCqSAYrQd7FOJudJdbHW/vuPYNsh3XPfEbndbu/d9xzWvvuHDfYPdd+BZd13cEmHl4YaY3sikQnfuPXuDYeXNxL8/viHId8N8A9Hy8vL4hlLz372s9//pje96Wd4Hn/m9a9//UuhL33jG9/4UsovecMb3vAy6EuhL/mu7/quP2M+I9CdW9QDXRI7mxu/yfv6J91nPOMZb/2Gb/iGX4X+4jOf+cxfeOpTn/oLz3rWs34R/BKB5Bfh/9LXfd3X/RJtL3/MYx7ze/7tRD4RywOPY2O7IKoc9FWUbLexpPLV1dJy1JHFqMUlsJx0aBEcYVW2ZFpcDDp0JOnwkVqjYZKsJ6kEQdSg0+e5Tgmuz+FjBC4GoOWAvGxaxtbDJLPDR6KWlqQj2HmI8qFD2J9R6+ChGn4tn2NVBTF77J7oQZvM9Tu80lIvXzwUk5VYVVW8w4uanZ3VwsJCuvnmm9/3xCc+8Zd5Hn/56U9/+suf9rSn/dJTnvKUX4L+B+gvQn+Rtl/51m/91n/iOWadevHm0I18cT3AT8nFNaAbffN4gEDjEVEEjRxwTroSM8uJzhOejj1SkxLMsrpjW0+z7o+w4+huRgh3jtuI3SpJZOM6qmbbsYqFqlRS7ivWs8xlTnWmM0oRaEYxefJgK89XMthptpat5yARuFrHxF63OcN95CupMWP057TItmGMvM/TnKpqhu3FWexfgM6BWdWaVxUHGlclicu/fdlnLuJeMQfek6k9JonM70tK6G75x9I8fkpushkAABAASURBVHOfjm0627q70sywzfD7av5JjOm4+uqraz4g7T7bcbr+W8MDx//0b415d7PcIh4IceoRJ4ElVlbNCoUgn3oE/0GGJ62YZpU8eTmQE4lOMjXH+Qnoje72ulZSwf5EIsKWKFaGqZ8TbEoz2DojYWtT9qQ7IIG5DPLYn8z7glZ9S3Miaysbh3oCMzPt3Lkzbdu2bXnjWNZZspE9sMYTvpHN7Wy7mB7gvcWFiOSnPcVpo/yBdoiEtaoosM4BBPWUkxKJiVWOJzQR7CPJLJEgHMpl/wZgUBbV5KDLpDRFkJmqnU3R1TuEpQ1abc71caDMKWGfsDnJV2UTJCj8CF8kuwzvjnzeQvSk5ci6veHiggUXCTitGGFmMrPMYwWmq666Ku3atevQikBX6DxwEg+Ek7R1TZ0H1vLAavRZq3WK55+sp6rnvEgekiMH6jW0mwfxFT6P+qTuffIqxbcKp0F79DpUMh13rME6TuacMxIaj16hpWwbxjQTkVej261jDhKX3wPHUS3Mz8xk1iSOo9raCm0ItLXzRs0aG1obzUxXXnnlfTt27PjoeRu0U3z6HtjAPfjJ3sDWdaZ1HjilB6YD/Gp59cEmWBO0Q7RjwjyyBPmcAJ36KsXpBJaXC5ocyE5Kq8RHaLHKPe1SoocDIiy0TNuLjwvcJiHk1OFlhzkPHGO7rEIB/Zy/Aim4KC3N6bZbU7xIV09cZqs2mDXlyy+//B8WFhZuvUhmdcNuMg/4k7zJTO7M3RQe8CRwgQwlP8n/BuOxw3nQ9jh/LH+1TqD3gJ9BWR78PdKDnCycR5kO03oajv/oNEGX5nNwur5GzapWxs92MKJTqxEA2V63FTg/Jyr4mcLLNIo1DvJJbrv7QiRJkdAbarT5mA6K5/E087FOPYAZFqcUSWJvvO666/acukcn0XlA/lR3brg0PbCVZhWPm6y1wbptsZRLTjLkde/nwX8CTxKeICZJQG2CyDR3n7r4lyfOVQI4iZ4USUaemBxReZWV7RxTnsZoUmcuuR3q83DbHV5We/h4IPuo5V0ASpI6dhT/9qjzzExeTindxzuxd33Zl30Zk/OWDp0HTu4BnuSTC3StnQeO9kBJ+PffnWqQ1NSdKpebLxl4ORJ+hXSGZ46sKHBtQfFcnx6YHVlvlPK4ULWH2+3je51E5gG+hbMcXs9Bn/ZMmYHR4FWI8mc/1+nIjHN6WRnGtWb7veA2O3xMh/MclLO93tai5UFdJMPbcoGL80HuR/Uszmyrv5tzHfjdoA7hN6dmfvWx3e+FovV5IvwDgNfhGwjU4cufn1gcnJubG6KmOzsPrMsDYV1SnVDnATwwEp/21UuyWeVfBLYedIagROLSDOVtkubBnGROCVS+srERuSTmlGaplMWCPkFt7NNZHsGDZ3Il/jg3yNUcpCtZqL1Ryb9u7+OrJzOCa24ngNJfblNuD7nNY6sHYiEmb58Ym/Vmba7TEXPt7C6uo8GK/raAnYnVmBI2JxLAxA4R8Bu7GDnb18PcgVwut8HG0TJjAt6eE2+YXBnLfIAo/z/FzKyRo0+a3gaeLtN20hO7TJKrLbA3iDHkY0gxj49tkeci8uz4s8I9UIHNPZ4dnqMUaee5Gldh8bLLLnPHnnS4rrHzQOuB0BY62nngVB4oo//fTTN16O2QeiSs/kJDS2i5nTJwWlD3P05rrNLayGYe1BiBYJeaDEHl7E8PmifSEn1MxySYKodwO148BXgN/EqlOXPfpqjc11sdzMXbHG3zOac+jmOimOTb2OB1xnd7st1epyW3F5Lz8LHaJOL1Y2SbHq6jKZ3NNQ/VKjiq0jBrmRRIUKU/Lzw3/sz48+LPT48POoGk1uN5Kef5XLRDvcHs4vz8fN307q6dB07tgamfklMLdxJb2wPRk1hvrhoMdqgYXKbe7E7NzF6mfsZO9WZ2qJzbqQKEmTmF/izpwz+T2/GO8wTgOL6l42wqDyQla6BMPX36PQ9KnsBYZRW9WRbvC+rN7dBg9nLoLpWzYGaXwuyVMmgB+iS4Xn9h1O/vPDcZdlP5sTP2TD0QdKY9u35b0AMDPtPPqijm1WM1Zqy4Qm+7Ap+kA5+sHSXlYjCv0j9Zhz7rgcnWIT09vHnAc6qcwNIW9OElNmX/fOJgWn43M6j7ajv6lqexfcyqvOR58OfDoMaqzJ+bglV7CXo8Sz14RZiTpUH0P0uPuu7sPLAuD3QrsXW5qRNyD4xEUvL3MprjU/YcrG0axRmNU4MaWtNea6CKAFbVnsBK5JrHLO82rSQvD3eRNgekOzepB/z+Ab+vGeLZmIBt4zHbmXXy52Ag/9uPVeypTgMwA+aU/2ZlPasU55XSLB96elW/GqBwk7qjM/uCe6CJLhd82G7ATesBAlLFS/nIO5gK1JOkFUlctfMdsSQg9eSfxpVXYL61NPWoWWT6EXTnpvaAJy2fQEu97LDmknw7kU8uSQUJK6iKTnuKJLGYnPaav1vpzw7bjjXPU1IZvXeHzgPr9cBUZFlvl05uS3sgByVTIjA5eBsvh4VSKRTwQ0O9zCdxIS8Oj2vGp3JLYsuogbrj0vAA93RlIl7O99xDS/MsiGdBVshhoUe1LwsDJT7wyAbUB9T71APJLn/qUXd0HlivB/xJW69sJ9d5QHy49nykFExGYMpfyTZjG4hHKSXFKOULZYtGhTMHNWg+kYMawc5BsTs3qwdScy9F3sn3Mtft6NnwHLAs52z5bR81vBRJXEY5sSrjoTi697mtddouSQ+sPlGX5PS6SZ1zD3i0ApG0FXnzZVbLUosoo42QBI8yMh66MkhkNMEXCGp/t8t5Oo+HJ1kzI69GhRAyNWvqeVjKItCauZWZwxym2hvWpr36/E9mvFkzb7Oj6cn6TLcZiWsFNPj9bMD9J0GZQwmfJlojrq65B1Wm8t/fQzilSv7rENwe56cjSHZn54H1eqBLYuv1VCeHB0aSVUS7SiKByaJEEBKJrAGBKpeTENLxh5G8lKF8+OPnyJXusgk9kG9/agz3clNa6zr9rNAhCzt1vj9PJDh/nliPrdW743UeOJEHNngEOZHZHf/iecCXLR54gCcykD9t+yfuKbBZhImJhNWiTV4GvwXF7tzkHmjvZUObq/gQk47H1PORnxlFKSetJHkCcySW7OrWYuqOdXugS2LrdlUnmD2QiE2+PZRywStaCUAehNQeHqCi/LWYw7nHUud12NweSOs2358HhP0ZaaEJL9Mk45liizEh1Z2dB9btgS6JrdtVneCqB/zz9mpNvBdZwRS7Lfpn62hJ/ovOq5S1Gmq8rZXbKLSz4/Q84FnH7+3RaO9v5L47JnUFpRZ2bPjxB6JI8/nvb56eDZ301vXAsU/R1vVEN/P1eYCsQz5im5CA4z08gTklMGWyQidBqxWDNsEOPoI5mUG7c3N7gMdBDp+F31+nJ4eHnAnyszMp+5qeeohhfWpOPkjXuoU84E/QFppuN9Wz80Cf7jwyBBuRrGxCvSwPQvASNPEJOyPXm6SVxGGU262kluatJNq6c5N6gDvLpxqu4tbL6dGYWnnl58GQaZA75E7GhyKeK9pFKUbfV9QWO7rpnqkH/Mk5075dvy3qAf96fJ56TmJeMr+ACW0/msM5n6flBBh5lxJXhokExRozoidJuCFFwiIFzgi8rZ58nZxqc2ZZb41ZY8PkujI/yrmlkZEH26PavP1cYOrHMds00eljWfMNvoaDnLc7MiOoNiny4aG2ItPM5gKb+YfMiyqhzHGlHwJneLre0+vqPRwn7uVrMDycTizRtXQeON4D/DQcz+w4nQdO6IHgAZGASbQxa4OSx50Gxudsskru7q3TaJp45DwoO7LU2V0K1SpUeVpRYrCqkBw1w2AlAVz5DxmRy1SzYogFdiIjt91tSJVURPpWsuCTqhT9N7ZJCDCU5VSLN3o6+kBJ6sEK4CxO874B/SVwXQ7ngTbZFLSHmgQ0UiJJJZ+tL1ayKBe31SdYlKrDQKNUKAVDKub5SwyCrQlPebJL6A0pcJsaaHIgNSmdmFhabXN5h+BNUy8fj4QVR0PeMWOiE7uErye1jnQeWJcHwrqkOqG1PLA1eR6dTjHz6UA3Ldp2dZqRvPVsHsGIAkdWREwk2BO65dmMFg/URQwqqPunfFiTE3lOt0FOCeiTBoJ+Y485j35yakbAR8JEINbkcDnHpHqmhPGnuzLEdHWlbJ6kcs3HnEh5X4f8MpaskuT+EPNQttmYg/kcgLd4Aovm8uJwXRDOo/0D4ySnHdPW1lt6TPPJq9mUfGksNzWVk/fqWjsPrHhg9SleYXWFzgObxQP++AJWHkolQbsAISNErweCeVCTyMSKjDBe18T5kYo0znVDLkRWVLGgn4N+zkOfoCL4GyhwSSC8BqgHawdFkloAAmdGvVeTeo30a6yVTCyiFOQHozC22xCgbkcgKQW3C1g05hHViyMpDcES9UWVzC0w1YI5FSRxy3ZXCjbGzlpSFF2h3dl5YPN7oPlZ2fzz6GawVT3gCUz+GBPwp3zgNQ/eoo14nlu8bopwpFxOtJIUPDkYSSuQKETdE4VTWiXCvpwviQWZmsM1tpBS1nj6NOsyjAABu7SC3JJtFGMbNrktbpdR91bzC+Ma9QaJBFbBARHk9qmLRSoOiJ/oTEh7cUNhQxq1oTzUGXOMB/yn/xhWV+08sEk8QABXDsQ8xrksAn+U8V4lsbXWbJ1JiXdGpAqomgPZJH8HVZA2Anz6ux74LhBNcqDIqxlej5QcECXGENckOCSIE1EMEstBrUkNDRNEq5XQEy2ptZU8Iz+cxrYN6vVWRubzYCXp77xYedGdLtjE1c/IuzSh28vG/DxRh5z4ndOh88Dm94D/9G7+WXQz6DxAcFdOKLVEAnPUIariCXf4Fz08EWQZcWVZlUhuFDk96Ffy9pSzQE4RDX+SZHLioEw3eVnteAFZZ4ZJ4zE0y6JpLdryaBZanEBNzm/r04k0C8hbKvn8mIVq5hBzQiaRsRmZvLO8RaqxLYaRYmBu8FJO1IXMkxl1U+TanZ0HTumBDS3Aj/iGtq8zrvPAiT1gHoRbENytJkzzfoh3P5GyB3FPYKNCBHspkaASfSKrE6QzT8iZxhJ9GoyUCPqJBLiSQMhPLp9BeZovRjxzmLJOuW1eZlWY9ZnyGCQo+WEuxTytkjI8UfMODNu9pTYmyDsysRoT/T05p8BakXnUzLWG5tzm7anPYKW4APRtvERmGNadnQfW7YEuia3bVZ3gRvSAJyWH2mBMkmrtTGQCD/CJFQrLD64j9bSofjoEPZxR6pBKm8ZhlelIhrSEqiFdx3lH0H9YPMJm6gUfM5FQTgJT7VacAFgYJTfZImX0mIOyq1asJRJskYYqsKWXllTqMHYfAodV6mCm/UQ5LasfhxllHMnznlmhiJ0ZCpTdchIe5ZVkyAgb7QzBl7YbzarOno3qAX+qN6ptnV1n4YHz0TUHl5Sy6hCCTvV/VWXB83rvErkLAAAQAElEQVSJ8t/tiqxImq1ABkulUuSxTgNZnFGsekpj00JZaLT/bg2W92p2ebf6S59RceTTKod3Kh35VwV4tnS7bLRbCV69eCdJ4n6S2Ug9puzoR5EkpB7U0Yd/1sBk1kY6FoOJ7jJVCqP7VC/eperI7YpH7mhsXca+5dvVG/6rZoef0dzwdg2Gu1WO7lYxPKAZElgamqx2fxRKvDvjwmhSIlFGVnQpg8lk7kW8mOXB/XmaPF653l06D6zHA2E9Qp1M54GN6gFfZfhWWSLlKBUykljB1lrw9z40zJSBRHRYRoB/0mOu19Mfv0tf/WWlnvRI6RmPH+jJjypAT096RAGvhPb15Ef29TWPntVTHr2gpz92Tk977ABaQBs8/bE9ygM99XEt2vrx9CmP7utrHlOi63jqbU9F91MfO6unPmbbBHPy+tPzGOh7zIye+pjtesqjtulrHjWLfT098UtNT/rSAJW++hG1vvJLhvqKL1nW4x8+1BMfMatHPmyOZLZP2wY9/CGOACVZkezFyjAZZbgb8+SmbUzDOqs2qAfCBrWrM6vzwCk9kNgWS2y0RTbVHOJ9T4gFW39BRRQtY1Zh92tb737dsGuvfvwHvlT/4UWP0G/8zBfoP73sc/RbL32o/svPfYF+72VfpP/ieOkX63df9sWUv0yv+bkv1+///GP1mp9/PHicfu/nn7CC/+LlX3icXvNzT9DvvvSx9DkxXoPsyfDqn3mcXv0zjwVOwUvBzzxG/xm8+qVfji2PZoxH0v6l+p2f/hL9zku+SK/66S8ED9dv//Tn6Vd/8kF65Utv1u/80ufpt1/+hfq1n32Evvvf3aT5cKe0dG/2QWA1pzBUho3wa5Qn/eirM3wI4xyd50SNnRMtnZIt44GwZWbaTfSsPRDjxtvsYdeNeflj7PD4V8ryiixApWBJQUPFpXu0vdin2dFtusxu1U77GOX3sRUHRu/V3Oh9GkBnhu+Fvp+tuQ9oUH1QM+MPajD+qAYjMP7wCu1T71Pfbrdpuz6hhRPQmeojmh1/TGtR523TLdqmW1ewkG7VQmp4C/AX7Bb036IFfUzb00e0wyGoPqqd4aO6duYTuqL4GGMwh/G/aBt27Jq9T0V9SPODGXxgao4IqcT+Iojwg4SftBGOjfdYbQSvdDas0wM8yeuU7MQ6D2w0DxjBWJ7GCM5idUEwNKrGVqKJt0z+XszmFOsetRmlxVrp0FC9pajBUlJvuVKoR8R1VimCppEUKYOYSHxAct2A90c0KjFmBPI6GI+XdDIYW3gnwyguqcEidFFj6g0o18sajRfBkurxYdXVoqrqsFJ1RLwkk42HSkeWeb9XgZG2qeZ92LLCuFYZ5zRa7mHyLJ4ZcOcCkBr/JFarytDGO2zjmdRZtJE90DzZG9nCzrbOAyfwQA7IhOgiRVZbkQCdlJNLSDnZeJQepVrDaqyixxZjYZrr9RT8W3/wMh2PJWRCHCukppxiJUesasUYmzLUy5GtuUh7C2Msh3+hbi0a61o1uk9Ee9hUOEqpKBobi9JyuaReBlNJe1NO6pupZ1IZonqM3WPmPd4HDlwWGPYl5jOYYRUWSuXvuCCPZ+RH4JVTwZarsQoz3h8aCd/5GwnLYQmLN5JFnS0b2QNhIxvX2bYhPdDGww1hXKgTyUcksMhlBEhExsqlPKJxuSSbrZTmKh1JizpcH9TQFjVKy0qDoNDvqbBSJQHdUbRURf7Xtx56wwpEwlAO+kG5TD1WSRnjtamRRTxRnIjWJLlUj5VImIlyTpxZZ0RvrVTHCRI059uGstqK46gx8z/MimwcgiolxX7SuBhrMR5hrvigGKoO6Df8Q7KznLj6vDN0FJN5QDbAmVhJY4aB7uw8sG4P+E/juoU7wc4DjQcIiDmYF4RNW4Hk8Ye6E53koMlyKgwkCGWIhCAO365LuZExqHsxQNsz+i8AJyOaB4X8LcRCVhe5d8hChPJQU0pyPcPhkvplIf8WY/DV2ExJ8iplZlpcXFZyXTQ6TVBfbSmmiU1qqM91AkZWSFpBEXoqSXZFUaxJxWEkMoiOpc4rLCiQgBpopVyQXIMV2OkwkqpRNpVM0mVLa+YwmCulItGWNGJ1aUUQ3TRkm7SYKfCB+zHKsL+IyjT4nEVyFIeXSWy1BSWqYos0g3averPwbiDBB3SELEQLDUmGPoeg4mCA3M8pVWQ0DVjt6X1Ff6mQo9mijbk3jO7sPLBuD4R1S3aCnQfcA1aL+ElsYqsq9pRUKgWCpYNgx64bK4VEkvFk5oERSrCC470zjIoHQw+qBWUjODpE/0QCSmGkFJpAWMQgWLlfNIQJ+KnoT5IPbYltMwESmhEQK8ZicaJEvRiX2sY/HTH573X5GENWMHVKCiPTgOTjMbYOBE9WKj6mYZhDXlct57VwnjhsCgmZiE9OhLbvWhQ1Sm4AyROn4TPGQ5+vSCLzcCRPLgzo+hMrqloVgb5GCr/CH44W1Supj5fJZVE992EtEvdA1ShKbB0GT/KVVNQm30INJKqK1VoNgvUZqZ9XdKlfKvFuUP5ukC3JUJqEPkeo+yp5t2huL9zkD4H66CtVREMqoieqTYCJWuLZ0AQ+z0Szz83b5JmW/ko9Cau5+DDiHlsud5fOA+v0QFinXCfWeYDIiBMIgMmjEcXmrEUkVkheiyLmggAky+GIBgNCDKx1Nn1D02RRE2XyeFmGUvWYCMxWm4JJrHhq3mkVMv4lVfBr7IlKBHbGQcb7mRXy1YoH7gFJsk991t8TFdKY92CR91q9HhVFubyjMWAjXSc+wSRPgp5EV6jBVFDhq8teqcFgRsF9VZvqUa2qqqgHfCAVwSmyMpkVQkQ1idtRsRXpW5bCr3ieW5kYJokCC1KoUdTUwb1MVsNwachRp/PoM83D9141+lmeDjLcLzWfdlCOPAmTAmJRLifNUT7nZ6fwEvVAfqwu0bl10zrXHuCVk0ggSmPyzIh1z0jmAYhP7ikOCUDjFbhcbvOkRJw6mSl8kD9Bc1BKCZ2m0OspH7w/UrWsQd9UBpJbPyr2asXCEQnQY1GiH9dUqa6HKr0rgXdcL9OGzWUlo08iIUeLWe1mvHjiZWGp5WGlEU4cjU01SSPy6aEokwYz/Hizekt5nmINJ41lGluhsQJ10wx+7CHTD4U0kkiH6vVmJVZoKJNI8sJHCUT0JEPIxlKGl4/1n+UPBfKDPgmPG0nLnDJi4D7IdWCBMpaRHMn8m6A8VxJ7uVqE152dB9bngbA+sU6q84B7YCSFijA5VggjFWxHeQAsCUoZBKkSFCQ284hIUPIAJoKZ927hwTdaU4srbW0w5JF0AYIsH97ziqJgldArS6liBeBJlHhrcYl3Wvei+hCSB8EBAvD9KuMR9XRERTpE+bB6tiSrD7M6kTzR9kiGxjuyEbFyeTzCCMbjuilP7kRR9hVDT0U5Q7KeUa8cyBeYZRhqtLRbpe5XH5TCH2FJheEbHVGww7Qd1Hh5j2y8Hz9WOEikuB5+KmWGk8XhN8G4NyQw5XKCOamTmCiRtIKnOmhWQbufCfHIODUYM26tHsmy4LkpeV68XBYVz9FYXs/PEx9KTKPkvTt0HlivBzb0T/B6J9HJXUgPjOUJxOolhbSoQssq4jLlVUhLMk9mOfh5mAO5LCValJOUqU1kEu3tFBIFgrMcCipIYP5lC98CdLli0NOgkKrhAc33hrLhXQrLd6gc71ZvvEcz6R7N1fdom/Zqm+3TQjigYnyfeiTNxAqusMDqrCQfFqzu5tWMw5ib9BxVUQ5fkfkW4tKRA1o+tFezpdSv79QgfgZ6u/rVZ9QbgTGoPq1y9KmMhf69musfUqgPyr80EtE3XB6TyLgRRZDfLlnKtyzftnyBT7OOPfI9a5i4W96vZK/YVEl86EjAnxVLrL4oBz5w+DNkPEdOA89RYXWaiXzCUHd0HlifB3ga1yfYSXUekIbSeMlGowMaLt/HJ/39E9zHJ/r9JJb7wUFVy4cVR4uKbOUZn9ZtOknhRo+Da8VAmjh5JD0YZphCoE5MS2xJednqStV4OX+q/4rHPkxPf8ID9ewnXKWvfdyV+trHX6lnPW6XnvH4K/SMx12lpz72aj0ZPOOrHqInPW6nZu2whofvJ6EFDcpZEjCRXpv76JHkZ3p9DQIbgV4OUTddPaeve9L1+vav+wJ9xzMfDj4349uf+VB9+9Nv1rc99cH69qfdpG992s362id/rr7k4VeSqw7zQWQsTzwhFDJf+fp7KzVH/sDBjYvCZ4l27o8Bb/WPIMmCaKYagJ8RVVE8BNyvRY2HhzRePpBRLd6v8eI+jRb9meHZGe7L/NHooOrxknfu0Hlg3R5on7h1d+gEt64HYoxBcdivhgeVSGJx6T7VIBGcInB+tbRfCcQckBYJjASyFZcZJX/kQg54HvQ8mTkl2tHGmSsu47JwCaT+1fgwSWb1aMz24EgFW1JP+NIb9f1fd7Oe9+xr9EPPvlI/+KzL9ZxnXK7vffoV+q6n7dJ3Pv1yfftTr9G3EbC/7t8+RNfML2tmfFizKarPOPVyxYDHnpun7h5Ko4rVaIXPl1TwwWEwOqQbd9R62qOv1dc+5go99ZEDPf0RfRD0zEdKz3pU0tc+qtLXPXKkp3950Nc+8UY9/PN2SON9rHvH+FWsfkOG8P2KN0hYnqjk3yZcQcF9DGBF6ugCq+/EKsxXwFo6gI0HVPOcJJ4fQbW8Xxk8Q5FywvY4Xi6Xl5ftaEVdrfPAiT3g0eLErV1L54EpD/RzeWymMSVWZWwlEpkosz3kW0T1IlkHeJmtO5ZjfML3JEaqIggieNQJd1J3mUkxE49h/mgGRd6veQJLKYkkqpIXPnMzvfzJvWRlVQxvV3/4afDJjMHwE+qPbgO3soX2Cc3YpzQ68jEC9N0qi0OamYmq2bZarpbkyTEPt4kvRWkquDHRahKPWP0MZfUBDYp9qhdv03zao3nbrW22Rwt2lxbCbu0s9uiy4m7tDPdqttjL1iMroOog79O4fbHSeDSS+zsrFAcJn5P1dCBh+X1hNeYrMrxKaz6be0mb5erkEhWsltKoQRw21J8Pf2fqYFuaT0TwvW0ss2GadO5I54F1eYCnbl1ynVDnAZEZ8AIJx4ORv+j3IARWkloOThUyE/B0mSUFGf9gH5vI/JM6oCWfiMpcxmH0mcC/Du8CZib/Ong1HmpA4E41gc96JKWCd1wBGhALOQAnjVXzbm4UD8kGQ1XhsJbTIS0XQzBWNag19G8osv1Gp0151vhuGCotlZVGg6jlcqxRWSv2osbM1XhnWHFP6jgiASVArlAhHKJgcyqtUJmWpOqA+rguViP5Bwbrlar9SzSeuRzyI3JxQDibe0Uha13ly++dUEZTIB0FVr3cNMl/2c/BBwiR1Ew8I1Bxn2SUHdRTSpgQjO5b6uwme+YeaJ62M+/f9dxKHhgxWQKnMgg8pAlbA4LnMALYiaMREQ51K6frXKlQyMEwKmV+GyT9w1WbKQAAEABJREFUcTVCpMlSRWIcS7S3MoZKR0DcacH4BbYUBEoj2Jr8cB1hRS9dnHnpICedlH1TaEjKquSrIfOk4asikFjdun/cHwX+IWWx7esuCPhFMvMWNUdqiOiQfxHdkw2+FAgA9kTgBIT7I8ZwebkNuez3rpZNyoL6syLXp4rBF0+grGN3HjjeA/4TfTy343QeOJEH+EDvAcfY3vOg4/Bg5vBy/lStit5kEq5+Bg+sGTxuOTk5dwJCljc1tdU+ysHPuZ7IlIOr10T/QGA1Al+wocyOTDBUYFXofwGkQKasS/Wqki3FItPBuK/BeDBBj3djffXrMAneWfOmu/g8B1XBXHoaMNc8X593bcwtqscKrM/2YC/WJDP31VLjq3BEvg0caCtwuaVS9GAlW+LnoERNeNN9nQFHfk+NTzE2huUfHgD3YPU+te4L6AaTKiurSamWSKDKicq1M/CkbBIjNqNaUslSzFnqjs4D6/HA6tO2HulOZtUDW71EmOH0UIcnEmhOghCFph4IUlROcnogO0kzyvz3yBxpJcw1j6zrZgNRKTRB1anLZW0ksTCBJakA3quIQRm05VUaK7Usv0kveW6xVEky9nkF5mXUCwdzdp45L8/PfV0psf3YrFzdI0GWChUkMQH/4oYnnWR09j7+QYX+4lOG5XtZq0lEFRR9BpQmd8bLmjrCajnLibEkhNUckWdn0mdCGr6sS2ITT3RkXR6YetLWJd8JbWUP9Fcn38a5Vc7xJQ+IDTcQwBo0dRHLjo5cIhhqOtjloAmXREMM9Q5SKMQlA21Q2k1i4ZFBjoKS2gwE+CGq5j1MTeCObIM5TYwRc3ksp9KxdmS1m+qSRErP85KSGT4omVWhpBIMlNKsavVVm28cOg+kgRRnpPxNQ+oBHRM9eXnqN5gEZhMguHrP8Lngu5NC8mv0yxQQSCDrg+2yJMTV5wEebcrwMtqznqbcXTsPnI4H+FE/HfFOdkt7YORZzB8Zx7QnbKWSY9dKjYIHMMhap3ngckw1Zh4h2Fm+skoEZ0KcVyGBQBoor46nrN95DdrxPazm/mGk6EmMhBYBixaCeQAGpFYepZvhPMpGt72dZ+1zM5I2CTzhpUSCiFCxwhKrLVF2+fxBAZ8ZfF+1iXIKNvGDb93WiFb0TjgH0M9SIK9N+ZxWsUGprFf5MERdTnmQzGou9EWRUNMAOa0cfs9WKiuFGONRUisNXaHzwBoeWPspWkOwY3UeWMsDEWatNEk7VPw0v6wNb2oCHu0EXeWAOPUYZh5t+UQ79SaRwTDCIUHaPIDSzwiQIRYqYi8jsBQzID/MA7Jvn9WKVqsOiaQVVLEaqayvKvTht0nZO2xOeGKuish8wITmuZLUUvaXzws/KpFHPDmN8dwor9FYf8HztigWcEqsWkXSF++9JLYMWQVbIoHhY9FLJD657/PqDd8l4OrxtZNVBIrNym5l9eXGwPUzcYnoi1BBM5lcotKk1JHOA+vzgD9t65PspLa8B2KZPyETZXhsJkGJSg47K9RaN0WSRFtG/qhg1YQvoiYC3qYsm8y1SK6iYPupICEZ73ds6hO/94wIeIgsEHeZUJckMYKtB1yHpg7quYa93i+SBH01lrDH66jIzVgAjWByer8WmeVtLaREf0duOstL1sNYjS1RKSeFllbUSShHjRFzzeV9tSlRn/QRPmz6ZxGaaolklP2FWCAhFSQir/v7rWS1LNBgPgYUOzxZGTSgIqiWyykfON4TGW1KlFd4Lpkrp7gg13Y7ShL+VL17JzbljI1Q3OA2HP30bHBjO/Murgcmn7vln64jqcaDKERiOypTwz6CqDwohtyqxGf+SNBMDjN5gE3IeAxMJBTxLiajJGh7PyEZpaJOwNTjvU1Z+fubJBFoI6sF1hx5iB5K8moi1RKB3FUlD7rUAisui31iek+BlYMReN2kwAojyLcYR0rok0WkI+UpKFAH2CzKCMhIBCLgi3GwhGuRkXJ7RORMICX6R5AYKxpjMkZkJZSwK4IUeHcHEiMkl3PeBIIGrAjMuZmbZD4/bDXmW/AhwP2TQeYu8Eeo56Vqhh5R0YZSQfIqGMN9gX5L26R6FpiKQpLLBOTkB+HCDVFUgG/4UYKH7XIkQ8jrEGT8mllYJebm9QzEfH6JSoOohkrGoe7oPHAaHmifuNPo0ol2Hmg9MPX4EDRbrnIAiyIiKR8rbR6qnA+yDK0xRzQvTAAhya3oIApySoiRjaAEPC8TwF3G26oc+KNclQf+DMKit8kPxg/AMqJcvQd9p85zES87nUbLO5auJTPNO9Oy2yTm5YlJJAe32XU11H0d5LYcD4PvbQ7v0cD94T7KQK+Yv1hJ1SSURNKq/QOB8ydjGQ4zVmouE+F5/5r3iTUyXpb3R7UlLuLSFKQJHyNoiBNA6Md1cjp/UqRrU5riNYzu2nngtD0QTrtH12ETeOACmrgSkCZjej0jkncaeFA2PvubIkLeyKd/AlxgxVCy4gqAZnlcFDIeYCPBs2KFUJVDORUBV/QhtopFhTyostDQyJIqnmLHmBWLo2J1kXi3E1kt+Cf+3I+RC4Yu2J4sWJGUdZ8tSJC3In07slRAYcBEt9NXXoZRTgP9GELyIE/Z2wuNWXuM5bqNIH4mEAfm+5TwVQJRXjcSjWGj1QOm7WA1SXIJTLppDzLmkeGyQFlLNlGYOQFr1qJFpaocNcA/7qM6MJ7rYZwi+yNIxqoW3yX61aywU+gpBV/L0abpw+QWS1G5j+jnZbhyWJLfX3Me99lZ8iOJeYIJ1fGHHc/qOJ0HTuyBY5/ME0t2LZ0HTuAB4lUOTB6o8gNFgHJRD2JOc1DLhSiir5qjEQoE5rI2BQ+mORgXigTkGkWegFJW7v3EAZPUUTvYLhwDD9iooE/y4TMi79MybyocetFIUkbCKWgsSAoOueX5nVtQoE0cnriMbTm31RMwLIm2pj3IknOwSXFS9vrpw7BHzPVofejHPsM+wx+BZJbBmDmZtjQPF7CrBE4ngI+I3C8OVClaPArKdRf0PiRvxhG2BJ+jz9sTUh4MGVZtwkeuy/uZmqPRm0eCERkvZuoyDveh8sRchrZcRmRyMjIzF5p17NEOcSy/q3ceWNMD/iyt2dAxOw+sxwMecTw++YPk5ZU+1tY8gAFNwTsgmOMkATT4t9zy7y0NpAi8DF8kK3mC8XLdk1gxtO21Bkq5vczJxwjA0xD1VUwCPWEzEI2NuNpC8HJAdgq8jmmTMyq3GWbld3t9yW3Jco0I6pSonxHQ22g59tok1OBz9zm2oZ5V0kpCokseGx0pJxoYnEyNKyfzj9glaAasfFIPExjUeckVIevvOvOqindyysks0ex3NpCPIuUG/sGigbJ/aMhnsqYdrpTL4t5IcjUZMc8kwDJworP7YseJPNPx1/KAP09r8Tte54F1eCAS+pTRCE89TgRIM2vYk2sTbJHJQdPkvT0osxBr4hzyLpOmNBZJChEFDsp0kkE9YLoa11LSVhIeA2MGkkyhnpw6RPIx+FrRSWdXQEJIIBJsE3XXdTSiUm5zShwmUSTGyHrQRxeMOhcnxudJOUWfGzFtK22RwWJra2DFCSJOyaJ0WTmxVxNEc27gQkL0KzbTTUWSzMtsowYUpPylmEqw1fRxO6YwKWZ18gMGYyQHVVSohVbsxl+0+YnpTjLDmtKprusUO5Warn2reMCf8q0y126e59EDhDZCvMcff6QAQV85qFEmaCavQ+UgsSRWX+xgacw7r3FvSakYIT4mIPJuxSoJGNtagXdPZapUprHKOGKMsQLvuvK35qB9gnAZo0q69Vi5FCCg2NiOCyQ0iyZ5lJUfUf6uLdlIKSxTHsnft1W8I/L3Q3kLU0HJgb3eLQdri8o0kECwQLQ7LM/F1U/aW7nToEI2w82b6PViDGPFMARjbHV7R5QrecLPIIlFI/nYZOzg5YquMQNTSeQkMGw0tmoRV8AvBfA/U9XDP57QxBh1MVTtPjChn/uFBqEm4FPU008qvC7mbzQ6INnu7KQCJ5RwvO80YE2f2OJVVKHJSx06D5ytB5R/as5eS6dhy3rAA5LDHZB4nBz5sSK4RRJBLntjC1ZbyltkHvhIGB4lffvKiJhETmNJ4NAk4Hm3kJKKFBVIWAUwIevyGUmWdXgAr7DAaVQwelqSQPKIju40CfR1UauGF4nSiUQgb3MdouT9oH56/msQ5QlDvsVmtUSfkO2Jrl7e5YzRmNjooSx5EpB8DHmyZSwxZjJNDiMB4DvkEmiYEeJ2TUCtPW3Kj8xOcn3y+SRFfKM8p3EuJ+5Xyvemhz0Bn4sPDjHDRS0bEaRWZ6bU+VCCYinbU0za4SOf8v2mCS8lo8mLIE6Qp0x56kRqqtYVOw+cwgM8aaeQ6Jo7D5zEAx6EohL/2kfJKXGIgOjBzt+zEFqJXs4HHviAAeWA6cqjrDCphlaJZMWnelYKiRXEaCQNBnO5fxxXmhv0VS+PVMMvQ6GaxOT/f1ZFYhppWVX+Zt1QVTpCqlvEhJHGcYnyshKJqoqVyl5PMiNwo1ZRFqKU/9J7UvBvSkYjHBcyaCJZid7BE23wvwK/RNsQy2sZfQslWdKZg3ENBPwRmG8GZQxCaa2ixGcS+gMmBtLFHGPPq7Q5pRF+J8H3kEnMK1ZjbMOYbLMUQim/NxH7I3OM+Mj9VJVjVb7ywnfBoobLi8gGWSikMYgD9XtziqNIIosqmWnAFyH1ZLEnsdrtWY/7ZJRLECSBnKWgFmRmGTRI+RNFQg7/BjimbBecVRln0yeyql5aWqLWnZ0H1ucBf6TWJ9lJdR44hQcSQSgRoGQEwhXZSLBLyisAVlGKNRGsBvDyHwDJHZQIXkbw6/dK9cu+inKgRKDsz83ryHisEduJRG8dWVpUv9/XwrZ5JRhVhqlGjcOHziiTQgFYcQ16Qb1eqbIk4BYFSS2qIijXdVSQ+Rs09egfxyNZXamEZySU0mZl6kuMEbnSRUxGiaCczGRmSiQRf6+0FuShmjmv1dbyDPscLhtJKBGdbpUnXMdotMzIkgW4llSTyOPyssI4alCSUPChB/4QgoqAnESiMdQVimNhLrPBj+Jo5sDc0VWBaGIOtLOPOhwuqcJWHA8zKNEWSuYnPjBoKBTBg898mbQqfBerSsYcGVD524hKYmDJkyiJ2WnyMlyYEvNzvVo5MHhSNjMl1y1Uqjs6D6zfA6tP0fr7dJKdB1Y9YBTbp6gJQjD8TCSISoXVCrzfKY0y23cFq4GCwF0SRIm7EklFHowJgIkgPWaJNa5ZKZBMPPCNTGx4jZVmTMW2nmoS0zLvyA4tV1qisdJA0WYUA8nGSkUVSkRnVMkxGg7lqMe1qlGNMgIxq42ymCNxzapgxRfhB5JoiQ2zvVJlIDlUBf1npbhNdVpQZOXj49R5vJ6c1iS4xCrIyIAOsp8cXnZMl71+PCQxlCP2sK0XJRKHL3YiK9NIsrReX8JfMS3jx2X1bagB6MVFtvmWxcYrzsUAABAASURBVNBKJBSfa8HcjUxeqKdeGqivORmrquDf6uQdpGhPKlVbAZz2NKpmVPYXQKH+QIhgQ7WsUc1qaFAr9saK5UixiEpGm9VCPfejEFlUxmqu5A4VvLsMGnHPx8BpJfkHD2DeR/RFvT8iTSIL1NY8LQQmvmZTx+w8cLwHTvgkHS/acToPnMgDttLgwZToJZY0kErBKsLmSIWNVNpyRj8MSRQj9UhuRGAZka2sFnWZlrRjeEA7Fvdr1+iIdsWhti/ep50E7IWlfZpfulc7xge1ne2vXeOkB267Wtvids3pSuiVmo9XaK66XLP15ZoZ74Jepu2Da7W9uBKZhRzU+4HEVAcFImmKPP51T4ktzMKC+iQQjNFwNNY4zoAdUnG9YvEAVeWNqoobNepdq1F5rca968G1GlEfl9fJUcFzeNnRlp2ujRs0LuhbXKNx72qNy2s0Qnc1GTOWD1DoPQA7dqnCnsg2XslqstfvK8jyqqxk1eorMWNFlmrJqkJF1Vc5nFM53q6ZCl8A94tjUO3SLL6Zgc6NrtC25cu17cis5o4c0bb779WV9VCXhUo7RofVu2+PLqsOaCf35PKlw1pYPKhZ7kt/fES2fFgWj6jgngVbwp4lykP8ugiWZZ50NYZWbimGYdwkkSnphAerMTth49k0dH0vWQ+ES3Zm3cTOlwdOEoJEwIqAgMVeViT51KNDBNsDqkf7lcb3gwPSeD+4TwX1eT7x7xju167Dd+shdkhf2lvUI+ywvqS6X19Cn0fEQ3pEAjqgL4kg0V5KD/dttQ99WjN7SoW7FhTuuQxcIdt7pbT3Kmnf1dK9YPc2jff0tHiXqVieU7+eUcm7HeWgHxWsp7KYk0LSIsH5yHBR6s9odscNuu/wNt1z6Ardfeha7Tl4g3Yfvn6C66DXghv1mfscN0FXcfv+B8nxmftu0h33PziXvT4N52fsvxmZm3XngQfqzoM3Zuw5+GDddfBm3X3/Q3Q3uu49cK16sw9SlbbryHLQCCjOqt/fqeVRpTErsUgS7pVz6vV3sbrcqXRgRrpvXroH3L1N2rMg27Ndxe4FhTt3yO7YqeKO7ep9ZlYPOrRDjyu364tIXF9waJ8esXxQX56GelxP+vylA/pCEtYjWBl/OdHiUQPTZ/OBZNfSfm0bH1QY3ac0ulex2j/BASigLQ793h+SsbqWeCbEkSaAnOBkIRbsBG0du/PAcR7gsTyO1zE6D6zfAwSloDbmJD55R8mXBARBVUtaZgU1XNyn8dJ9Gi3thd4D726Nl/dqtLhXi/v3aHn/bs0QCL/4ylk9+/MfpH//iM/Tc77s4XrOFz9M3/+lD9e///yb9X2P+Hw955Gfr2//ks/T9z36kfrmL/hSFbfeo3953fv0/j/9mD7wZ7fpI6//jD72+tt16xvu1G1/uUe3/NVu3fbWvbr1HffoU++/V8N7o2xUqmduca3A1uSwSqpCIZgKsz3ZXI/VUakP3naXXvwLb9P3Pf/P9Jwf/mN97/P/VN/9/Dfou17wZv37F/wVeIO+8/mv1/f+6Bv1PT/6F/reH/mLKQr/R15P/fXw/xz650fR7/0xr/8ZPHS/8M/1nBf+hb7vhW/W9/3EX+r7f/xP9f0v/P/0/T/2J/rBH3+dfvBH/ky/+XvvIKEFhbkd6s3PKrHVWJGEK38n1SsU+j0Voa84IlUcGOve2/bp3X/7Ib3rz9+n9/zFR/S+P78F3Kr3ve7j+OtTGR983af1wdd9Uu/5n++SffKg/n9f9CV63uO+TM995BfoOx/2WeBmfecXfY6+75FfqOc86gv13V/yBfrWh3+unvm5N+nzd/bUW+IeHrxLNfe04l466uV9ihn7VQ/3azw6oJqVW+Q5yM+EmsOCeGKMi4mVl6YP6rROc7py54GTe2ADPzAnN7xr3TgesCSCUgN/oAhNJLKkFJelMSub6jD0QEazGrtf1fA+VaP72VlaYpNpUX0d1rX9Wp81iHqIFvXQ5QP67MUDejj9H0YgfAgrggcdOagHLy/ps/hQ/wUE9G17ljR35wDs0uwdV2pwxxXq33GNerdfq/KO61Xeea0WPzmnIauNxd2F+uMdkv+SLwYnVokqRppZmNfITPuXD+lIXNKwjOrvvEyzVz5AH79b+tgd0kdulz78mQYfgn4Q3gfAh8FHd9O+R/oo+AiYph+9S/oI7R8GTtv2tp5laXPqsh+m/0e8D9T1+tjv/7T0UcasZhe0aGNsPKShHVYajFTMmoasciq8KBJxEWZUDC7TvHYqHJpT7wArrXu3a2bv5Zq7+yptu+sqLey5Tjv23KAdux+o7Xddo/n7d2iwb6ybLOoGPlR89vBePWy8T5/LNuJDWQk/mA8hNw8PyvEQtg8fOjvWVcVh7vdeBTugutqfV15CXmPucQ2qQ1J1JCPVy0r+XkyiTwO1B89NW+xo54Ez9UA4045dv84D7gE+TzshQHkpUnZAOP0LB7JKDUaSxqBitebU68sku2UFDVXSMh+i5vnUPnvkft7RHNCu0aJm9+/TFbyj2gUuGw51TaxU3nuPyv1HNLtcqr+0oP7iDs0c3qH+4QUVh2akgwOl+weK982oR5AuDy1IhwoFmxWGyrcOawJ/CIFEOlRVjVT2B5pf2K6KpHDw0CE2v/paqqTDko6op8UI6kKLtWlxLB2m7VAtsfDRIaZyIno/bQeH0rHU5e8fBt2/3Ne+xUL3kuv3L0n7J/T+pUBilWDpABfjPVgi+YZeUDkolXz7k63PXhnUKwp2R00jthWZHP4tFJYGmhlu17al7ZoHc0uXa375Ks2NSHLjXdo22qW5Mcm6WlCJ/ivNdBkfGHaypboDv+8Eu6qhrmRbeNd4SQuL92tu6X4t0D5TLcqPoqwVuKcGhMfklISVqZczRjKrgfcAnrii8L4XHPC6s/PAWXggnEXfruuW9AARiLWTMkQwInylSM3TQuS9jQioOKaNT3lrcSSlChDMMt8QcD01vKVJIKRI1b+k16e1x4ooEQQLts78q/CxYqtvXCiMR2IBIhYOSM0okZhimqVzz3OTEqsrlcuyMJT/f2Pb6jmC9ZxmNUAe+8qxlotKIcwRa3vqsVpcKJPCWBodGmqGJLVQkCRGUWUhVfSqVDBOTamWuf0gMAUDFDUNTfHY8TuqzestPN/kX0lj9sn1J1OMkrfjTMaiwhWzlLCjx4pmUI9ko0JW99k6DBqEGfXrkG2vUWa9UgjIHRGqUoNqTr2RVFbI8A6txgsjDB8yWf9r/zX3xG/PTDEj/927AhsqjLDQw44gsWpN6An4xBNWUYyx1lSNkhhJw3GdU1dyB7i5Dq/wPIh7Z+bWR7FFiD5BgRooTzLKzDvD5DQz6lMMeN3ZeeBUHuBJPZVI1955YD0eiFloNSTlKhfnTwPWyun8Sjape7BjgaHC2R7L+ATfNPGYJg+bJW2RGE2fBI+e1BRbBaIjK79EkFZOH1FFVQCSUuVCSRU6RyDSNxG0fZhA0A02ULAZlVYq0CYSS2TwegK3zSg7heSA7PRYpOQcl2zh9ZPBR/F2n1/Iel1FwoYE28d3amaTBFowtZ4SdppbSqPPISIfLUhk99qdqFJG9iuYR+HfwsR/Efk6kHhIRjVJPmY/0SU5gvKBX7M/kRflEAsZei2nq4iGLJUvPmYuTF8SFc+MwH8XTn5PYB1/RlgOSHd2HjgLD0ye3LPQ0HXtPHAOPdAmifWpJGLyaT9MIJKTBI/OybgQcitITZkFCy2JUJzkbR4+PbaPqIytp4otw5h6hNye6lw31hKiLrnGhA4H6lbOJmGtVFcK659DpM8Y/SOopyuvswCilrCnJgE5p8KAOvZVx5IVTYGtho2sU0NUVURFVpbkGnnyQRQZdGBchWbn1cj5L1InEpjwlWwosyUVJDJZxWjrP9c/t/Xr7CQ7D5yNB7okdjbe25p9PU6e15m3gXI9AwVFWYpT9rTZxgjhPN6cnnxcl8MsybwPAd1Ieh7Yc4A3kgE9IsHfx69VIyWurrqWv4+iySvrgutwnErYlCYiq3NIOfkmxg5A8iScWA1FVmPJ7cR2X0WlMFIiEUWfB8ko0YalcniC9nlHtg9lhbysPCMfLkrISu3YOu3jzHue9lBdh84DJ/UAP+Inbe8aOw+cXw94zmEEwioriESYTWoCLsxTnIagxR7xuEc8btGnzDsjttNoVkR/JMgLGGuYQIjP8NUI789COZQK3qFpqEBSMNotVMooJXbUlF86GcY4ICLJrCIzzu5ix3ePpNpaMY/PziG0VihqGbaG8gj0sBJUrKjyyop1ozE/1+QJxpNwHZJqY7Ygus1sL4rVXUh9BVZ1Ygw5X6d3rCc5n57GTrrzwJl7oEtiZ+a7rtcF8oAnoZMNZfndjScuzzh93il5Mivo0j7aEV4SGZI8VuT3Y2XdU1n1KAeCeVDBUqcg4/kXIAr/EkRdiPgv0S3H+QJ1fppfWgQKLSiewdmqMx/H+7eUwRPMxGopr/6iFLCpV5cqKZd1UohRRWV5TiV7iT2fU91nXmWWNRznycbMxNTQ3tgappK+kcgYirYzO/m4gXvszDp3vToPnCMP+JN9jlR1ajoPnDsPpBOo8oDsaJqDQl4qFYqsMGoCtlhZRFYeK8GZbbaChFAQ6FUP1Btt08zydvWG29Uf7dTA6/U2zY8XNFuBuF2Dal493kFZdG2MlAAnagjaymhYpnN+TP1EGgN6tcCOQT2jmfE8wP7xtmx3Hzoz2q6Z4U7NjnYwn20S8ynHMwrMN6TGPjOnKME3RuIyT2Se/FmtCt45n0OnsPPABfSA/4xcwOG6oToPnA8PsCYg40SCvq9eREpzGNtrnsACCa6X5iT/ZefhldLyddLwegAd3ygb3ahQ3aBQ34jMDbL6Ws3FXZrF1OCxn4wVAOqV8wH6TUbr2Z+uJf8Qon9apZnJSNAFQwzAfH2FetU16o2vlY2vVzl6oGz5gdLidbLFa2VLV0tLzG1plwaeoFlpZtvpK+wN+MIAy9LMUZe8Jn7oyGb3QP752eyT6OzfPB7wLS7HWhabmcxsraYT8MgwNpJADEOlsEx5rGBjmcYq/GvedVTBqmShd6Xu/8gB7f+XJe1916L2/dOyDr671oF3R+37x6HuftsRHXjHUAfftaw73rpXH3777SQMqUiSWJUJHUbZAUcJ/Uk1RWzgeqYnKpuuXnBVDvYQ/b+mEUnMk+eA5HvLP92tPe88or3vXNa9bx9p/zuD7gcH3tvTgfdTfk+l+/95Uff98z7tve2wdpS7lMaRFRk2+i8g4xMBC5XI0mAkeVIjwVE44XnsvfJ6Bj0MLyc8QfGMT9dlZuTW1Oqw5WXuY1vraOeBU3igS2KncFDXfOE84AHNceyIK+Ht2IaVepSvwJIlRfMsIMJrzAhKqpeiDt6zpDtu2adPv2evbvune3TL2/foI2/brQ/+7e267e179a/v3K+PvW2P3v/Xn9QH3/Yp3fGRe3V4v1h52A7KAAAQAElEQVTDBRlbb0FBRx1GbTIWpbM4j9HrmphwVs8M5mxWy/tH+sS7d+tf/u6T2HinPvWP9+oT77hft7ztXt3yD/fAuwvs0W3/uEe3v+8+3f+vixofjuqlPhpahRUzqLySwRDy3UZeneV6d+k8cAIPbHj2Gj9BG97mzsCL6wGPrxfFgumA60E4G8FqRYTnBCKf6L3s/ICAY9Dra6Y/q1mSQX84qz5bbduqK7UjXavt8RrtqK/UQnWZto12asd4ly5LV+uycJV29i/XjrJokhgKjXRgmXJZOYNg68wP+mO32ndT2LyqK9JSq07LKoZJ2+KCdukK7YrYXl2ubcMrNL98hRZGV4OrtL26gjmwBTrawfuyOQ3ijPqhlLJ/VrXmzJW/pRhgOiDd2XlgE3uge4o38c271E2PnjUmk/RVw6Q4RYLMgzQrJSkQsEsl0o6mgvRoNFKqa6mifVyoXOppMJ7N6A17mk9eHqi/3NNMPaMFbde2sJC/Vb9U1eSoKMkhH4HyuTvTRFVkFJvWbmIeUcrjJoWYNJtmNFvPqhwGhUWpP+przhYUhmUuz4znaJ/PZS0XqodR42GlZJaBMrThA5WS+yuDuvvPG88ASe0MzqBz16XzwDnyAE/xOdLUqdkwHthshkQMbpAUeR9Un1ZwDAoeiAnKKQfoPkHa0YOaQgjyv7/YC4X6Vsj/G5Y+2THEmldDVUZJuUeIL3mHFJdHcgRLmhEq4Ev1SonC5PQfHeBjTzhnRuzobl6dwH3CLFQWJIuqUqgrtgiTBiGpTJWsGmpAkiqR96/eF/7Ve/8qvvrq9XrqDwZYH1YgT5TZXnj0ww1Hj73O2lpbvuvsekqx86n7lIN3ApvSA/wUbkq7O6MvBQ/Y2U+CcMw6JkrT76cmgVoE7TpF+R/HrevIioxkQJAPtPdJaIOilFEurSf/VxD8y9QjKZboLLy7/EjopqcXp+A/OjZVP7MiVtExKZFqGJTy6uljjqn6ajKScUrS6kwxUB97ybFKFckMM0oSdSAp+bwMuYg7ahLaiKSX8EE0vISpeR5Q5bHQbJVkUWdyuG1n0m8dffjcEbKV65DtRDoP8IR3Tug8sAE8sFZQNDt5LAuskExDKSxJBrWRmgDdBuagXtmXkawSSUsEfzhi4ZUTW/JvHJIYYsWKBYQ0px5biUWYU4xB7Mhp+jjKRg/+nkmmBU677HZO42gF3kIqVa+3oMK2KbHdOR4FOcT2Yr83K/9L8v6fY/oKxlSoLAes3AZSKMXE5X8z0r/sEgPp0mp4Q6ViSQmfpYDPPKFp/YePs7b02XMnugOHnb22TsNW8QCf47bKVLt5bkgPEK48WHuCmASxbCZsVkRSMtYoJAwI9SinjUDM4TfRJi9BLSc1VhdeBxFB/z+2xhWyVIxEZmYya0CwVDMmPwZsR3py84QgVm0lsjMkBVTkEw1olNzOzEgodGSuZGqO06GNLHrQ0ZQbHatXEimVYTUm6Y5lTL4ssKqcwQ6Tr7T6/b6KosjzGMexxrz/89VnMy/hMxRMn/hptdqM7XX3YzLJEx5XWN4GmZw1bS7jbUFHt01EzhUpuC+Mdq7UdXoudQ/w03upT7Gb34b1gIcqFgzs4GUTA09jIhHxyoftvSD/QoMKEbCjSlYRA08+BNB6PCKg5y6qEHCIKBuIwgWB3t9neTDOQZc+KoJcN0sZdI0lArm3V2lEfUR9KOOlUvTfoyrHKiiLd1D+NRE30ftFxke9IgzMzL8/VpDECkmw8pbG6VLXE+jptJCyTkhzmpOYdbO4koXDkh1Wzb8qJuyVcBDJDQ7vERXgZSWVov8XK+Z9GxRJKlhZmn/hxZ09gcWefCsypVp1YaxpKyX3Hx2SxqrqZVakUTGYql7SIhK9PvXxIlYz/jk+zcw12nA4dNqh88ApPeAC/vPjtEPngQvvAYKrgMdcH9x4P2Wkr0S2iJ4tCLpVLSVCec37H3/PIwJqb8BqJG8R0mYhtwsZ4q8cUpQfrsLh5QbOb9FwXNYTWiIJ1KFp86BOrkCgdK0y64tcmYGJWbvRGmT8KzISAgZOh7psVJBU5qtRWjlTU6ogFclSbJUGi9SYL/5J2UCvw+L0ks/D4XNqoOyP7BM3/CiUEqPWrNxQpzEJpA6lxsyOhagKVnezgzkNBvPIlRpiTwrWJDWSXoDbQx5yrk9GOtcqO32Xsgf8WbyU59fNbQN7wIPrDAsjD5Nz2NljhVCEPkmpT7DsEWNnFGxOZbkgFXOqrAdIKCxNRqy8qmj0kgJpxHU55KuU0wmDBGYztuPQImiERhJjJIHWlCsSTMQuJcZNgdxQYl+pimRbqQ8NhH2Cu84E6ENHmkDoFImwoTPMzbcNe4qRhMP4hi0hmRLzdiCw7tOQPBZifv7hQPhV+DTMzsvKeUXGqsal4qhQDcbDwJh9FSS0yP2JdcGccUWMWFuguTs7D1w8D4SLN3Q38pb0wNSk/eErCcweBgvokbKnfbN93bswq307t+ne7Qu6h/K9OyjvmNe+7WB+Vnv7he4rg8rLLlcK3lsyM53RQWJKMoJykJHEEnpiom6lTAPCPOm1mJcnURWeTL0MbDtj0xYc1EMDK7bJEcoFObx8YqAvbJPZNsmRdVHOurapgFdoXqWPT1JN2MWg2KR8mFmmZ3MZzC6oZmV7H0r2z8zovm1z2ffu/73b53QfPm9xYJ62stBodo50O+CODfCbsN8ydI6OXo+9y3Okq1Nz6XsgXPpT7Ga4UT0QMWyJMHgQ+mnWNH+z+zb991vfr//y8ffpP3/i/frt296j/0z9VbdAb3ufXvupD+r3oX/4sffqzz/5UX308H0a9QqCveXAHqRMLSVK6z+bL0EELAlKrEqSCnJFDwWzGpSXaTB7ucr5K8CV6m27WgMwu3CNZrddp5lt12bMLlwnh9db2pa9viboP7/jWs3tvEbzO67Rtu3XZszvuE7bvA7mZ3apx+rIV4KxNmwKMuzzd39eUz4C1xYU1zhDirw2cwjaIOGtxVjr1n336PUf+YD+2wfepd/98Dv16lvfp1fh/1d96l/02594X74Xv3vLe/V7H/hn/dEH36N/ufdu7Wc7c6R01EhmdlT9TCvj8fjcKDpTA7p+m8oD/uRvKoM7Yy8dD3gQDUVfVgx0mGm979579Fd3fkp/cfftev3dd+jP7rlTb9x7p96w5zP6c3hv3P1p/eU9u/VX9+3VO+6/W3uqoWq2/uh6FqcpscLxRJaIyZFLVCmRzIJ/E7C3oNBjVVRuV5jA+pep6G9nB26Hit7OCXat0FDuQBaZ3LbKb2Sn6n369neo7G1H34LCwLGDMujtUI+xe4MdCmGOdNGTEnaReDQ5/NuKk+IZEabNKqynPaNlvfPwvfobktkb992Lr/foz+66U6+763b96d5P6/X77tAb7rlbb7p7r962+y59arysIT5KgfBhhcxWc47ZavmMjDo/nTqtl7AHeAov4dl1U9vQHvBwZ3Wlqq5Zh0mHSSL7sPheB0+mlx1evx/eXuDbXgegXk9sg8VgRwVRmvIZ0DWNzFzjYshlRAqkCk2ShFmpYP5ujndD/o4o9lRBa1BRHse+RnVf4zhoUB9PvX1U9bPc2rTU4WHSoaF0eNl0ZAVJS8tJi0tJ/j6sZstTJLBkOIU5JNVc4wSQNc7AdKaxKtL2i/KF3RJ58UARtRuBe4D7eF9P2g/uM+l+xnRfHygoM/zdgsJfCliRankihLXmPXB+h84D59sDPJbne4hOf+eBk3ugYHss9AfSoFTdD6oIrOPSVAdpLOqh1Ag64j3YsJD8P+og7mvMSqAN7Ccf4cStxGgaCewW8zabYsorM5hK6Be2RUcaKPGOrCaJ1SSUmpVITD1F9RVJeDUyjoqEs274FzaKWVk5Izkoh0CZFaBBnT+q8EMMjGEKjCOOvGpUrfzVQ2G7zuzwbzIa27FVWWoJFUdM2fcRKkegzpjZ90ka4/vRBOpTyP45fnwz74zCMzy7d2Jn6Lgt2o3HdGPOvLNq43rA7OyC1PTMItFyTCCOrMjyn9KIUWQLIiZRk+DdI1kURNUArVk6jGGP1IiMkq8GPOnAhNeeZiYzy1W6ypEra13qqALZIOQ9kXlsVlSskgr+Je9M0grWxyyyq28zUjbsSfTxRDAN/6r+ehGL5KmIVaiROwsQqE/KjF2zzEkKJDmSJWU3378SX5LM3QOezJy3Ftxsx1pt07zE/C36TOAmQG4UK02Ngvp1qVnaZrChhzKrJDM1xxjBFJsy12lbpss0dWfngfPqgXBetXfKOw+c1AMeBKdAUiJTeHzOKAiepA3ShQjpq4o81q7W1i55ICXurt04zS3CJDC7HT6OUW+QsoKA9ASsskQySbLM82aqStTOiLoakNCXmGtiWegUdeikYcKTK4fpJEKPPt22oznrrXnPwIcG0uZqF+YYgI9uSlhg6uH9AgRnRkQdNUks9+VW+X2D3Z2dBy6GB8LFGLQbs/PAtAf8IWQRJBZAcsrrFsK6MrytkAihIAECaEk9gzjq7VRXTppVE1SjrbDkwf9EaKU86Une24Ep6OCNT242QrmyNa7UR3Q0cqItTZLP6VL2K5WBjmjy6a/Y6nWmK1/l+V/RaG3xeUSXx54kNfLUUwv0uEwL1zMNuqychoIClFFoE6tAScwl0kAe0xBdvm27rMR2bmKlaJSUj0KRe5IEM9e7S+eBi+UB/2m8WGN3425xDxACCYXEwYkfiJ05mDrfUdNaEzYr4NTFPCATWwmgkgdgM5OZedOa8GB+bIPrzqCbfxuxphIZIyHs40QyKcXcbYXmWnuJcjtEH7lA8jSLstOlok+r8jiKUcfwYpYPDNmiSSpuwjGiK1WzE49hZrIUeQeY5KM5VjqGKFnNO8nIdmdURCKPY8qHYQtWUEaOa3s2HwbaWkc7D5x/D3RJ7Pz7uBvhJB7w4Ojw4JeIoh4SfRXAHpZSL2mZJ9RXA2NoRWD15OEy0yq93qLle8B1rNQpoJ5QTKE9GSgRyCMBuWYFwis3JfbMshxUIFmhRJuEASCR4JruLAObAokgnBFanY2aKLluh0iPJrXJNFHONmVqrDQ9eQVF7InYFp3fAl4CqMhnmvBzhYvrbOFzadsTbfl0Bu/BtMKo0BbxUG5tLuiMjF43tZWr38OVSldYtwc6wbPzQDi77l3vLegBQti5mjWPH0G4jZCu2Dx4Orziw3hQ97JTxF02wncRj7cU82nmQrl43MVlj2V64M8gRKeilIUGEXsc3icZyQK1Cbhsq8MDuAfslGo3B7ZbBCGw+1Xrpo30cVef60RHM45L+ORbYFckueaVn7edHGZM4BgRs1WeWVNurlOCEwajMU/Tyr3BOZEsl0CmfPpwO6d6dsXOAxfMA/5TccEG6wbqPHCcB8w5gSAZfPGlviR/R5Nf0JAbPJ77lleO6dRpzqcXIwnIaWZMLp5wHF71wJq8MIEnohYTFmo9RAelEFRZYpUTm99bATMLrQAAEABJREFUY5stYlXMY4RG3G3NiFI2zOlYZoCNt9Om7SQ1faCzrfoYk7LPqbUluU0kHqfGStGMOfiqcQqClzHV33VMqkcRpi2fltCbG7xvLjQX32JlhLzt2HC6a+eBjeOByU/nxjFoU1jSGXluPNAG6Uxj1mlc/Q0TO4c5T/h7L1jHnWnC8Qd4GkUMsuQQFEiqSVCL5UD7B/PaM7dTt2/bpdvnr8j417nL9a9zu/Tp+YZ+cmaX/rW/Q3vLeR0KPcUc0BvbVldYJD0CfmsDQ0h5DtLpUfR6P+AJJuvDduWCJMqRcZaKvu6Z2a7b5y5bsf2OuSt0x/xlYCfYlbGbud01u1P7+/Masbp0WyxJjsKHoiyOBMPHizjbjAs8vwZo6/tsgzMd8KNQAG1Pwy5xTJopnbPTuj87dc58uSUU+XO7JSbaTXIDesCDaqokVj3Ea/nvf1HL8TMQZQtnYraL5UhM8KWaw6cHTzNTILZ6gPZvyRUkMO/Tq0v1KJdst3lbHfq6b7Cg//GBT+iVH7ldv3zrXfqV2+7Rr358n34D/Mqte/UfPnan/sNte/Xrn75fv/Xxe/WHH/q07qFP1e+pJMmEiGVuiIN1SzLCvfWwtQRtUjs9Kj/YihNgutT8xzEwVQduYZI125y7U6nfft9tekW2cY9efuvtesWtd+jXbr1bv/Kx3fBv16/fulv/8ZY9+rV/+bj++BN3aHFmRooRX0WVdcqr2x6+ygkssNpkTgn4f/MSSPIMLjZUVdDDsIdJOUtMVY1tWj2SkFKWVS6tNp2Dkp0DHZ2KLeSBsIXm2k11I3qAgLhiFk9jTYVYS+ykkssNpbhyTkc5D7Bxwsg0BfoqJ4IgKRHIl6tae8dRnxhFvX+Y9I4lcKTWOw5Vetdi1HuWpfeOg95H27uXg/5lOekTw1p3jSqNc4CPCkno5aLJwTgiiTYcH+nMYL7CIZm4Vp/LJE9TbfT5F04Okow/Vff0gVGh94yS/hm8d2h671B6F/Rdw6B3LZv+mbLLfIr3ZYdwYoVfIknGYSRCw2bzQaB5PlAGkrOcHgd0KE1x0Zfr8Ay9Oj+Hj3J+NHdaL0kP+E/KJTmxblKb1wPEyBwrj5qBM2EY1KNc8+CyouA9kCeaCoZ/u9D/VFWmCHkMLnsDFSD1ehoWQYdL05FeqcP9UovQRZmI/xqRkMhlGrIqHJL4KpJXYBXmAd7hCTKPzfiNcWinzDBYdTZnyAnXSCgO5eQQUGhKlIvejGLoyVepbtsy9g5DoSErwWXoUjmjQ2Ggg9bXAQdbj4vFQOPenFI5y3u+vmorFY2VY+pJqa8Qe+pVgBVrYA6RiVWM6H85pVbkHxX4GIBtytD0YZLL+QeOafY5Kpsf50hXp2YLeMB/WrbANLspbngPeNA8xsg4XSfQtkF1rYc2EVgdnsAqBPx/afZ6JCFFOtZmqoueYtkjjs+o15tXrz+rRCKLvUIR6uWqMHkCiyRHI+llHdN2UHZTWlA9q7PV41Q+2ATujojNI+wfxyT/c1tj/+ZkWSqVfZJUQVIuVPGuL5Lo6gwSFu0j7K7p539YucYXEd80RqLVGq8WFANFH9e/AOMJKSJbK+V/pLz8e3iw5Mj96ZMpl0Sqa0G1Oy9VD2yCea08n5vA1s7ES9AD5iGyDY4tlQiRksdzhVWmB1wPvh6THf7wFgRiF/GATDf6RLWB2xOZv/NJKHJE3g1FGo19tsBWXGLbMIYeK7GkJSWoVLECq2QakTiGdcQOH8Xh2kVLmkDn6PCZNDBWY3J/TBBJWonVVk1SqlhJVaHUCLBrKF+RLTP3mpWj//1D/7p/wlqRpIIq3FapTCM0jWQGxIShsrFkQ5nGKljfmfcBSRzuSINyOsmJbFKGHH26AGMdzexqnQcuvAdWfzov/NjdiJ0HJh7gMcwBfFKFJA+S0Pb0BOYsJAnMDdd5Hnd7rDpyciOg+6rDv7AQCbAemAtWVqEoZL4CK0pFkpRICMZ7IyrysvMiCSOSMPx3xpL/gV1HMCUGdWiNg6Y1uKfHcvsdSj6z1b7tmIGVlRVsA/pqEdtrMxJtIbfTen0p9GQkNqmUG+srKTNTj/kMmK8pojTS1CCS7R2e7GhQiHVecXmZzIY+lxdFA+IIGWnF61T9NL+AllLszs4DF8MD/oRejHG7Mc+bB867Ys8N52cQAvn0Azk9kFHxRHVUOwE0JMLrVFsgkckDt0V5oK4I0lWq5BjDH6MohqDoCQvU4vCMgTiRXsnLLUh2zna0LKQnJ4PKMameLTFGcWBjtn+iL1aVkv+Ff1aRYi4ZiTUXQ0fWUjEVqnjHlf/fsUiS5j1XHJsSq816JJKUeyygtVRNYhszpzHvyCpoIjGFFJRXsz5e8gvIdkAnp8uhSZ7VcJ9WDlspdYXOAxfNA/6EX7TBu4E3pQfaUHeOjPdH0HG0ujwIQTJTmloJWNQkTz41lZqGZvXVSMLKQTkH5pRYnyQVTZOaFRrdESLuq2KVJlYtIhmIxNaUaaefZApFofN9RLKCw8dJlBvq1yhPwmQjKBMwJur2uJ1UybbkuogfjHkBEnLJiqwH7bE6K5APeW70I1El6p7EIjTCr9DjddFmIM+UITV1+DDOcuAOWtDF1bzBQbk7Ow9cbA80T+XFtqIbf1N5wL8IcK4Mno6FhlIHRDmAs37Q1NEnQNfUXSYSVWu22vw/yRyykzbmSa5JPh5gyyj1EXTMkKB68B0as3XmnVOlZd4X1WS3Zi50TjTQrxkyyKinKkJTBsPmE7amkZlncWl0+VZfQksUg0nyMsBukXBywkpMKNIOz1kmk7wQx7KeKbBNWI+XNcvWYxxXEu/05EdLKftYkW7RgmoSoieyvC1JHRcqb2syhOFXt4MilgRAJx8roIRzQkRDA0mwz/hs7sEZd+86bnEPrDyPW9wP3fQ3ogeInYlIacZKAzpmO80fWMK5Fqkvs3WYSFKRbbEIFdTyu66CuF8Qx4OWCej+zT5vK2Qy35ajL6KqSWY+bXJZDuCWtEKdf2EQJ8M0NPlW3jEwJAybnXqicTu9bMxfPfJIXFY0th011mh4RIqVQp/k0ytU47BEkvIEn5IpsHwNrLxwTl7FLePbIc4oJFShFR8ktjArKCxF/jnFdZCAFRBOt2GlQr07Ow9cLA+EizVwN27ngWM94A+jg1C62pSSSl8ZwPEwzxpDvOohABcaLCyoV8xoEObUL+fVK7dR36ainFXszWo8mNNofpvq2RmNCdYFq49iVCtEI2yDEPJWoycGh4/b0iZpTCK5Vo9EgpnGasuZlcgrmoYnppMhkFQy8AsZWQpjBl5UtJEKElfJBEIvyFeny5RtMGClVtI2o14YaGA9zfLurJ9KWSg0mpnRIbPsUzI/uvyM2SaymlfA0X4wOMfdJ3jd2XngwnqgGc2fxabUXTsPXGgPeDQkKciRx/Y0lQtHXXy7qSDgiuVAJclRF0GfOXRQt4danyiljzv6QbcNKA8KfXwQAOW+dKuNdUfNamVmloTYy4krVrWif2ECfe1JzG+LF476quio0Y7+kXQXuX+c6zhK1CvOxBf+5Q//yyTjotTSoK/PWK075nv6dCl9kqT28Z7J8SneA34i4Bcme1uo9a/4fn+/5N1hT4UGKopCCggYfnZH6/h7cnRK07k+GPlcq+z0Xcoe4Gm9lKfXzW3De+CYkHVMVWKVULG95a+DAsHVVy0qTQfqsd70wffo5972l/rxd75ZP/auvwJv0k/8819lvOhdb9ZPvfNv9KJ3/I1+6e1v0v9477t028H7tUhMLqyPiqB+0ZOU5F+smIbzaFAeywsZdFSUb6NNIzedxcXoaySyBlTy6T+WDZKCHBF+g4AVwDvSpiOsS4tZqTcvDbZpGbx/7z79p7e9RT/91r/Rz/zj3+kl//QW/eS73qIXvhvqeO/f68fe/1b9NOVf//u/1N/e+gHtE1uRaK59u9WdzXiezwqn8H37EUOoBdCdnQc2jge6J3Lj3IvNYkkOn2do7NrdskYP0cc3m0dS2EUolMxDKisEGSFX+telI7ol1foQ7R8EHwAfZJ32YeD1Dybpo/BuBZ/kXdEiKxQVfSX6VwTqindKzTsj0hY2eNKaBt3O/3nUgP7j6Dh+2Gmxtpyl2CLsA3dIPY6qQ1+HSM631SN9AoEPk4A+gD/ej8AHoR9l9h8DHwYfo/2jqnUXtNIMnFLBGB9f4CLVtURNjdcRSoDT71SkJQGq5/q0c62w03dpe8Cf0Ut7ht3sNrYHThGyfCvRV2Bim6wm6XhwrQjMkSc3MbPxBCNoZQWhuq+RBlqmPERmyPai0yVCcSwHGkXRmwb0Rd61RcaPbKlNv+eaLrt0AwbgnF6FeRnWmZ9kI1tZhQVWeRgDTzk5BPQGJcpHw+ABVqgIqCDTlKOx/NuX/aJQ4F1ZCkGHmdP9CBwER9AxDqXGoUca65G2StUkuuWy0MFSupeJLKKVnCUfvigCvbDCRM8GcmdnrnJxqjrhnjNi50xTp2hLeKB5WrfEVLtJbkgP5GgYV0zL1bbmFX93xappNOadFtR6PQWC8ZAuQ+QqkpNDoVCyQIAOqsh0XhZ1uQ7kY9mXyl6TwJBFhGhcKVNtsMMzyVomteF9QvPUgjQe4ht/v0eSHy8vaRyZl/8tRZZQKSAMbeaZ8E0i0Us1vhTeSAXtbM+Kd2Zk0TxqXeFclBtNkOxCisqFLHFeL4EjD3fORukUXdIe4Efgkp5fN7lz74FzF2ByhGwCpptJqQmwuUIjqwoRaB2ppaw64nica74Kq0hbEYhtRcWaOFtleFkeqInnigmeNKzGKsugesy6jYCfv42X3wExpcSPArBjIMGfgifHabipZwxWQNOrvkQ9JxKnE6UGbSFcYn5xvzhoq0KQryhTEZhOraKMKqyWKuxOPSQ4fa6s2Nwn7uM6ew8Zn7v//oF/nz77ZKTkCTDRB0HvUlGskE/A70MDmCt1L589zEy+6jazYjwe+5TPXmmnYUt4gCd9S8yzm+RG9YAHTAf2OWlBVR6vM52+TAQmRHnR4iHPGSuBlQjc9nG+A5kIGnlvd2YUrKPQdrtg1BNWi1MM6ra6iFOHl30+NT/FThNbiDLSjtNU4j9fgmkyP59rlM/aofaIFDLDCy3gTU5SnX9EoHZ8G8zzcRYh+PLxfKjudF6KHuDx34jT6mzaiB6YBJc2fm5EEzubOg90HthiHuiS2Ba74d10Ow9scA/kdeEGt7EzbwN5oEtiG+hmbBJTLtmV2Cbx/6VuZvd8Xep3+BzPr0ti59ihnbrOA50HOg90HrhwHuiS2IXzdTdS54HOA6f2wBZbiZ3aIZ3EyT3QJbGT+6dr7TzQeaDzQOeBDeyBLolt4JvTmXbuPWDWfdA/917tNHYeuHge6JLY6fu+69F5oPPA+fNA9+3E8+fbS1Jzl8QuydvaTarzQOeBzgNbwwNdEtsa97mb5Wb3QGd/54HOA2t6oEtia7qlY3Ye6DxwkfF5s54AABAASURBVDzQvbS8SI7frMN2SWyz3rmLZ3cXZC6e77uROw9cSA9sirG6JLYpblNnZOeBLeMBm/yNzi0z4W6iZ+eBLomdnf+2Yu/N8+2xzWPpVnyOTjTnbqV/Is90/DU90CWxNd2yeZnn0/LRaJTVF0UhsybWeNmZTvkE7cXj2jLzAl8a6yaDBh7zlLJd+X89iUmFhfxfd00kOnIRPeDPjcNN8P9TzGmHzgPr9UBYr2An13mg3+9nJ1RVlf8DQ6/Udd0kB5Ja9P+EEmZZllwlb8uF7rJlPdDr9dQmqGOd4Hx/Vvy58WfFPwghU1NP0O7sPLAuD3RJbF1u6oTcA5OVWPJgY2byAOV8D0ae2NoyQSgnNpdzXodL3QMnnt94PJY/D62EPzP+vHjd+f7cmB21bu6SmDunw7o90CWxdbuqExwMBvc/7GEP+z+f8zmf8+aHPOQhf/fgBz/4rQ996EPffvPNN7/jpptu+ucbb7zx3dddd90HLr/88g/ccMMNH1pYWNjXeW1re8BXWrt27bqf5+E26C08Gx+5/vrr/4Vn592f/dmf/Y4HPehB//dzP/dz3/oFX/AFf/OFX/iFb3j4wx/+ZpLb4a3ttW72p+OBLomdjre2uOzTn/70Oz/0oQ9964c//OEn33LLLU987Wtf+zWvfOUrn/Lyl7/86T//8z//zJe+9KVf/4IXvOAbnve85/275z73uf/uUY961B/ism5rCCds1dNXWiSoP/mO7/iOb+WZ+GaejW960Yte9OwXv/jFz+SZedprXvOar/nVX/3VJ33gAx944nvf+96nffCDH/z3T37yk/dsVX91816/B1rJLom1nujoujxgZtEFnT7mMY9ZespTnnLw2c9+9r5v+7Zv2/M93/M9//qjP/qjt77kJS/56E/+5E9+mPb3IluD7tyiHmD7MD3+8Y9/9y/+4i++i6T1PpLXh37wB3/wk9/93d+9+xu/8Rvv+8qv/MrDPEPDLeqebtrnwANdEjsHTuxUrO0BXtY3X2dcu7njbgEP+Dux2dnZI1tgqt0UL5IHuiR2kRy/FYYlePmqrViZa1fYch5gxe7fZLUtN/FuwhfMA10Su2Cu3noDsRLzJLbuiXvAc3gHp/4tNqden8ZavOn248r+1X8zD6YZZnbUN+aOk9+CDLPVPGN2dNlstX4mrimK4rSegzMZo+uzdT3QJbGte+8vxMxPGbwIcPnr+G6M/6Kroy1HTz5UzI4Ooq0MTd15DjxgZjm5T6sys3xf3NeO6TYvm9kJf/9LU8ekbzXFutDFbrxL3ANdErvEb/DFnB4B7JRf6mC1dlQA9dWXJzb/arZTdOR2syaomq1Sl72Y87sUxnYfux8da83H2/1eOLzcyvh9aT9ktLy1qPdB93itto7XeeBceKBLYufCi52ONT0wMzPjX693rNm+FtMDoyc2/2q201bGg6aXnbZwWed1OHMPuI8d075s/evU2/xeOLx8uiPRJw2Hw1N+mDldvZ1854HWAxsyibXGdXRze2BxcbFkBgZOevJJXf5J36mZ5W0sM8t9zCxvW023qTvOiwfMbMXX7u8WmjrMLMuYNfdHJzjMLN9Hv6+zs7MnkOrYnQfO3gNdEjt7H3YaTuABM1s4QdNRbP/EPw1vpK+TvJXoq4QWLucN3u5B1ssdztwDvt3nvnQN7tvWzy31Noe3O1oZp15fC9PyrOCMldjcWnIdr/PAufBAl8TOhRcvER0EpvCWt7yl/NCHPtSHzrz5zW+ef+Mb37j9j/7oj3aBa17zmtfc+Lu/+7sPevWrX/3QV73qVZ//n/7Tf/riV77ylY94xSte8dif/dmf/aqf+qmf+poXv/jFT6f8pF/5lV/5N29/+9ufgmsMnPD0RORBj22nnLBc0OvY4kV5kG1lnPone+d5uwfaLHROLltTybTf3b/uW/e/w8ve7p7xutNpuPx03cvHyrnMW9/61q/mmfjKH/uxH3vq933f9/lfdXnmC1/4wifzrDzh5S9/uT8/X/Trv/7rD+NZ+uzf/u3fvpln66Y/+IM/uP6//tf/ehXP3a7JM7jt9a9//Zw/l+9+97t73P+TPlduS4et4YEuiV1i95kf/sd9wzd8w28++9nP/oNv/uZv/sNv+qZv+u9f//Vf/z+o/69nPetZf/zMZz7zdc94xjP+9JnQ/z97XwImSVWle25k1tIbi4CKzMNxwWd3gwI2As0i4sMZXD4FN4QRdT5eA755MmoziKOC7DDsNM1m0/tCbyDS3dAbCAqDvIeDvpFlQAFZpNl6qa7KNe77/xsRWVlZmZVLLZFZdbLjz3Pvudu5f0SeE/dGZxbyd37+85+/+3Of+9zav//7v9/wd3/3dxsuueSSjWedddb9cDoPXnzxxb++7LLLHoFzeQxB6f/ccMMNj8HJPAo8Mnv27F/fcsstv7r55pvvR1DbtGTJkntXrlx5N+TqOXPm3DNr1qx7H3300a9Uo5eBiGA9OrxJkybJu971rvTf/M3f9Oyzzz7Zd7/73fm9997bf8973uOAMn/33XfPY4uqrmdt7F9RngHyPn78+Pw73vGOHvCbAtdZIAfeszgPGaAb6W3gvaetra3QSXTeCooyCQabBx544Bu4Hu5DULrrzjvvXIrrZOXChQt/uWjRog24jn4F/BrX1MOQj+DG6GHiqquu+g0C20MIcpsR7DbzujzvvPM2IvhtPuOMMx449NBDf3XIIYfcP3369E1HHXXUfZ/4xCfWAmuAtcccc8zaY4899pfHHXfc3biu70L+Llzzq3F9z0efnyhjpqpamAENYi188sqZ/vLLL09fsWLFmXAWpy5duvQf7rjjjpPhNL6+evXqr911111f+sUvfvHFu++++wuUd9111xdxd/v5e+655/h77733f6xfv/7YDRs2fGLTpk3T4XgOefDBBw8Epjz88MPvf+yxx/b53e9+967/+I//2OuJJ554xx/+8Idd//M//3PSU089NeHZZ5/tePrpp5PPPPNM8s9//nPyxRdfTL7wwgttW7durev64p966e7u3jl58uQ7//Zv//Ya4Mb3vve9t77vfe+77f3vf/+cfffd93ak50ybNm0e6j6NlYIvDGVEOTKKdZ4Rk/DEGhEfcGmpy7zi3ponbYPJI1j0tclgktSgHAdTZeF5Hr8zZ3Hz8P8OPPDAG8HxbASt2z70oQ/dhsB1K/KzcDNxDc7JJZBrsTLLgHvXF9u6RNEb7ShFJpPxXn/99bYtW7Ykib/85S/Jv/71r7xG2pEe9/zzz0947rnndsH1szuuo72efPLJvX//+9+/F9fah3DNfRT4GNKHPv7444djFUZM/+1vf3sUrsljcG0e+9BDD30aq73jgc8Ax+PaPX7z5s2fw7X8eVzXX0D+C7jmT8DOwsk7d+78eJG5mhwFDIyCT/EoOAtDOAU4EHovYgh7Hd6uIqeIUSyc55PYnrwWwffiVatW/RiB9l8QgGcCP8Aq8wcIvjOx3TTzs5/97EbMter30NBn+YPRrHzJmNJyNWWM8Y8++uiHwfmFa9as+dmSJUt+hBufH2Ib71zwfx4CwGWLFy++cfHixUs7Ojre5pYuSWJbyvoQa236OyJWI3TwoWVAT+jQ8qm9NcBA5Awhzfbt2zvf+c535rGd1Y2txJ1IdxF77bXXjv3222/7HnvssR2rsa1wvF2oHyxDGhhTmwQMgEf3LBKBqYfcEh/4wAe2UZJzck/wXDCP+nnUdX9LzsMqLuhF35WB+BjQIBYf9zpyyEAuF/ygA5+3IIjtgS2fPcKiioIBrLOzs2K5FtTGQD2BaNu2bQYrMYPtQeEP+yKg1TZIE9WqZ75NZLaaMgADtQSxAZprUbMxAMfC1QnRbKaVtYd39SxgAMPzFgEM0lWvy3Q6nUilUi21bcp5NhvAN02yvClgYiBMnDjR6+rq8nB+3HfABqrbpGXYgR7oCWGTWq1mDchAVWcxYGstVAYGyUC0CoN3cV94xvMxD4GtanBCnQQwyNG1eT0MIOAZnCeTSCTcF56Rr6e51lUGhoUBb1h61U6VgRoZ4F09q0bBDCss6e7uFqFyANCRRm0GqKZFNTDALTbcPFStyaDFLdyenh6umN13+Ko2apIK2KFoEkvUjKFmQIPYUDOq/dXFAJ+tMCCxER0NHer48eOrrsSw/cUmikEyQO7BpXvOVUtXvHGIVsAMarW00TrKwHAyoEFsONmNoW9s97TM87CInsgZwnaqTJRnphIY7FBWNdhJVKPkUUg4Frpo8cMEEzQmkIXZlMy3oC9JRFyDz5IOSiqGWdRzKWNqqu7qxv1mTO+fmjHGDPT5iNtUHb8BBjSINUCaNmkKBlrHizYFXWqEMjA6GdAgNjrPa6vPSgPUCJ9BrEyV8xHmXIcbGgZaPogNDQ3aizKgDCgDykArMqBBrBXPmtqsDAwxA7oSG2JCtbsRY0CD2IhRrQONHgbG7Ex0y3HMnvrmnbgGseY9N2rZAAwYvAYo1iJlQBkYIwxoEBsjJ7rFpln1v0Hr9pcUvj0gePX7j+Mm/IH/fkyGerTRo7UYUGvLM6BBrDwvqh0hBvhlWw7FhRUR5akbCKhrgYGqjLmyPoHMBa8gYPXRR6ywnIjyNUrfD/rETURL/WJHOL0GZhy2VNG0DGgQa9pTMzYMK/qyrfAnp3K5nI10AzFAZ0pHOlCdsVLm1e2ag0BEfngjwBsHyKq98NzwZ8Ii3ms5TxyjmVDLPJvJXrWlOgMaxKpz1HgNbVkzA3SIEydO5N+pSsDRJKo1ZBBDvWrVtLwKAwxI5BKyahDjn2HJZrOGPzvFX+4gqnSvxcrAsDOgQWzYKdYBqjFAp8g6XV1dkslkbHt7e1WHCgear8Xxsl9FZQbAo/ujmOCyqi/ASgzxzifvrbiVWJkELWlpBqpeuC09OzW+6RngagrOURC4BB5S9tprry441h3VDJ8wYULvnli1ymOrvK7Zkn80sOAzAznggfOT3XfffXG6coIVmftzLAM20EJlYAQY0CA2AiTHMETVlUwMNpUdMnSiXIHJpEmTZJ999nl+zz33/LMM8Pr973+/+1tvvdWJKhrIQMJgDm7jor194403dn388cff+8QTT0yotCrDDcYbeH72Buq7AzcbTuqbMhAnAxrE4mR/GMZGUGiZAMbp4+5esApgUrZu3SqvvPLKnuvXr9/LKcI3OFVz/vnn73nmmWd+5JRTTvnUT3/607MeffTRE1HcBugxCAbCQJT87W9/+2nw+v0LLrjghNNOO+3Ic845Z9/ly5f3eTb5y1/+8sPPPPPMf2fgGz9+vLvxGMTQsTTFtdRSn49YSGpk0BjbaBCLkXwdOmBg586dwj+2CAcjL7300uQTTjhhjTHmRZS+gjv/15DegiD2X7fccsuvly1b9gs403MR7PZBmf6CBEgazEHO29razJYtW967Zs2aM1evXn3rnDlz1l5++eVPnHTSSa/heeVr6P9V4OVTTz1WqS/hAAAQAElEQVT1ZnDeya3E7u5uqPRQBuJnQINY/OdALQADqVQK78K/GJzA6uydcK7/DYq9cdf/Tsg9gd2gn4T8BKAd+Zr+7hjq6TEAA+DZPd+C9IA2YByqTwDI9x54AEb+3438e4BdkTeog2RrHrgh0huf1jx1Fa3WIFaRmtFeoPNTBpQBZaD1GdAg1vrnUGegDCgDysCYZUCD2Jg99TpxZWDkGdARlYGhZkCD2FAzqv0pA8pA0zKA53n6TKxpz05jhmkQa4w3baUMKAPKgDLQBAxUD2JNYKSaoAwoA8qAMqAMlGNAg1g5VlQ3Chjwi/7eFnaQrJH+f5LEDN88MZ7rvFQ65RC+WU98Kf4YIw1duRFsOeXY0g3jCR9bRDbTbHHFN5M5aosy4Bio/Y1uKULozPu4dR9d0akTeREPkcz96RLfIKjh8o+CDKoN6mA/gCnAQ//BGIEuyAvKHQY1WHFjg0wAazwRzlMgC4AKxX0CGPIuwlOitR7KQCszwKu9le1X28cyA3TCEarwYJwXdxENNV0GEocroB5prGn4LjXLoPbg34dwfMO+iMFbpT0oA63AgAaxVjhLamNlBqJ4VFiB9Iag4kY2cu6UgPWwLDMAApYhrI/FCVCPRN3CGAyGgC3Ax4LLAn0llmfiIMHLoI9Gx3cz5RwIsei2135XhnlxFJiEuTEVwnEVplX0MqCplmRAg1hLnjY12jFg3bvAf4cJinKXtI8CKz6ClwjTOeQZXJhGMnLq9Uo0LX+gX0YOjtVHlq8t9Y4b1Ud3DIIeAqEnmBPnRzhCYAPLgegIFq0hP+SOiApVKgMtykB4Rbeo9Wq2MlBgoO+lHLjwQqEUL0V8582jGmzHH2tvFNLnZRFEBkKfyshYSSDkNAZxz73QCcZkcDaWUcmHIjqYD2pxlhEMigmIMXfobyeOvlPO67qFZ6WmKwPFDESuObis+X8oXPDif3hANeYJJHsPKCyDAVY39Ut0g/Z4L3P4oa5UhmqKQlva2wjYyUCI+Ciu43O2TlGu1BXomzLQQgzwk9NC5qqpykAlBhgsbP9CBKdgu44uG5c78pZu3CZR1xPGkYFWTgOVoYPgYCdBKnzHOGGqV5TowjYUA40xYBk6Z/tgfpyLEc7NGszVBW7oUMcH9FAGRisDJZ+s0TpNndeYZKAQ03iZlwKO3i3TWMmKNbVLkaB+0Cbs17I/sIwgiXcc1EMwYDowHcLVjcqpC8Zmv/WBbT3xEbB8QVB2Y4eSaZoEsHcGMoItfIlSzCmUgdZmoPiT1NozUetbloG2tjZnezIJB4yU5/VellE6KkNx4UgmUQ9OOlDQMRNBjo7bpQyfdaESVl6eaRMDZ29sArGCY0HyeZKXE2kEbIuA4OKfGyx8YwAhGLwoCTz7EkgLEy2eXZmCgVXGNlmRSpC8YHjAiGBm4iWQRVDDHMVxCH5oA4o5HMEARmmpA9yijW8iaOJJR0cHUsERcR/kRIrPQWlZVEelMjDSDHgjPaCOpwwUM0BnyL8UbIwR34eHRyGlMcY5VaYFr1wOzh6SRyKB4INELhfUp/9Gtv9hqHJvTMDZW2HwcF92DjS97zZM1imNWDHo0DMGZnhCGfaE8QySBAQCl7BOCEEAZFvqUCroxol+0uAjyoBUSQr6ZxlaW/c/VpDgwfEEbVHMKg7QW6D4YDUGVerIdTqdZlLIMfU8P0xT5vMImig1hp0ioccIMqBDVWIAV3mlItUrAyPHAB1l8Wh0oHSq1EUrADpS5gnWp293Tr/UM7NCAWEhBGKNGJuHP7eSsL54eSuSx0cgn4AeKzM/WZDiJ1CWKOQNVnJSVM68wcqKw1j05aIQIySWOAYQjOIQpqkzPjUWJVY8Rg/Bi4EH40s4Xqk0ob6sZFvxEary6MiiX1/ERECgMVb6vKBCJSlGFI/a29uF/BISvixs5Dlg8KJknkWUzBvDDqlRKAPxMYBPcHyD68jKAB0iWeBKy5jAKdKhMkgZE+TpMFknAp0qES7cIjVkyeVMH46ghWgkiFgiJi/G88XYHPx41jl/zwikgU4QWFAFbRjsPNQgGAeYLyedTnJoj/44jo9nZQgq4l6eiEkARgQ1OE+LMidR10oWY9IGg9LKEPRpgPIyDysxNvryYIfBlqjHuWGebs4YT1yAlYovY4KiTCYjxTyTX5bwPFAaY9x2YnGQMyZszAoKZSAmBvBJi2nk0T+szrBGBiLHGDlROlQ6UeqJSE8ZPT/r0zUCjyAUFOsMM3zjygQOPmFy4jlkJJnISgLwPKTxXKkN9cohKRZPl/qjt66PPhEUERgFYwj657AF0MkTBYWI8fKSQJBJIDJ6sC2Jtny0V4wEomOEYn3/NMZHAEtICn1msLrEfGBDAjqhPZgbopxgGkXAR95KIc8bAXJsDEiAOgpaSIKjhDDoRmmeE54D5oniNPMKZSAOBnBFxzGsjqkMBAzQSdIZGmOcw6QTBehmofb9MB1Uxjufn0G4g87XOeggh/fAESPhDsQCJwVBgysf36bE+j3QpbAKSolne4BuMf5OB892l81H+lIpCB5i0wgIWcQKBCcY4wGCgY31oec0MBxXRNCxLIFyrgYFwUZMBlVpC2zA2AYQ2gLJNOFJj1SE6cG43Rggg7F6sJLqFj/POTKfg542QBQdAUMexoUyNI888jxAI+TXGBgr6ApRCychD30O5RkgjfOR6ujoYOeCeijSQxmIlwEv3uF1dGUgYADO0W1XTZgw4fVvfetbl3zzm9887Ytf/OIZn/70p8867rjjzjv22GN/ftRRR236yEc+8uJBBx2U6ezshNOGk3ZemZexSwSdMWgwBZUB4I/hkVOSyXRJOrVDelLbJZ3eJqnU25JKvy6pzKuSzv7VyXJplkXI5F5zdZnPpt+QTHqHZDPdkvezCE+0x4dzD6ODn0dQRB5ZBjDByksQH6yfc22ysCWTYR+vop8A2cxfC+lMOtBVlKnXJZfeKtnUNsl0U+6QTGaH5LPdIjaLsXNkgUMKaSAipiJpjBFu5YLPng9+8INPAEsOPvjgy44++ujvgPdvf+Yzn/nGiSee+A9f+tKXvsHX6aef/o2PfexjP0bHGQY/SD2UgVgZ4LUcqwE6+NhmIHKEuOkXPgvbY489ui666KIN8/BavXr1zxHMZl+K109+8pPvnXvuud/67ne/e/IZZ5zx3alTpz5qDKNCxB8iRZQsku4/f9B7+xmxcPC51Ftie4DuN0V63hBJAZB25+tiu4FQSneoh7Qs73lTbOpN8ZH3kfeR9xEABW2kZ5v4mR7xcwwcgqCBjxWClSCsYfUiwctDUEEoy/uSy6TR1w6M/6a4cdGfRb9uHIzv7EKe0pVjjEpSet6G3ZgP5uUDufR2sfkeDJ0TE5kRGFD2PeQ/e8ABB2wAr+f+8z//84/OOeecC3HTcNuGDRsWrl27dinOwx3L8Vq4cOGK2bNnr0RgW4bO0saQWKT0UAZiZACXeYyj69BjngEfD2W4CqOzxypMdtttt9fx3GuLMcYSX/3qV/PTpk3LfvKTn+yC83zptNNO+w1WA7dgNbAE5T2IE+DQD5FH1gfgw6GxiGv5HBIsdtt7GeF2nfjbROx2oAuAw+e2YCVgy1EIH6ubIhim8zvROfpAfwkEyTZEDYvNN9+3zgbsA0LCHv7vEdsmxm8T/munYX4KY6M9tg5d/xyjEdAOH/1ICB/2WMwTq1HOHRTABgwFS5n2obeAowQ63jyA/57p06ffM3PmzHX/9E//9AI47zn//PNZBTXKHq6MbcuWqnKsMRDrfDWIxUq/Dh4xwBUBA1lPT88uqVRq10hfSSKABZ66UIF+NUJBWZRgGSNaFrpeGMmK4f/ok1xdUrhdh7aC51IiaWzX5dGeY6B7HlwkuudekQ4fNQu4Mov6WaQCROMLtiQFdgjsqUvSjj7Ioe/yhw3VkWQWQcxiFZxmuhYkk0kuwcLJ1NKieergGiueevMYppY0zEBLXogNz1YbNiUDcCyCoCRYgQmCWQ5BjN59QFvhSHvQJooQA9YdqJBj14uoP59rHAOf6OXEImBZSIEUD2Z50LtAhjT/Ywn0LPeR9pkGhOVRZzFKBLEcghiWp3UZwUBWVwOtrAwMBwMaxIaD1Rbos1lMRNBy/0HDx7ZiR0eH7LLLLlnIqkEMAc9HEEOkkBF/MeiVDmoRkHwEtMAgBC5s2bk60FNG5UHgQjk/eajvyrC9WK5Plo0EcA7y4JP7kfUMF0y1nhZaVxkYBgb4URqGbrVLZaA2BiLnTYnVgEyaNCmHVVa+Wms43Rycb2yOlPYGNnJB4olvej9K1qWR5/YhEVTEai18NsUm1BkmYpsCLXAAjz64r3k7MZfL0WhEYtdc35SBWBnAJy3W8XVwZcAxYIxx/ztx/PjxWThJPu9y+kpvcLopbIPF5kiNYQCCdQxYBJIigc4tsFzwSiBqeSL8Hx54d3rI4IDe1Qlycb0bY8QY43d2dtYcxEJbGcjCZK1C6ykDQ88APklD36n2qAzUwwBWAkJgdcWVWBYrsarbiQxiaBNbEHPzYxCyDFREEo/CPPEMggL0HiAhPN8EZXD7RvjCx47tJIkM0niP8wDvWfBZ73ZinCbr2MpAgYH4P0EFUzQxFAxgmyvwk0PR2Qj0AXuF4H/XRlCScePGZelUaxiaX7ZFWKih5iCqGNOfTmOKdAhQDFae9cVIXhK+lYTNAb541AEJ6gEPesJAJxZGRUAyzgMr2gxWwPyuQT1mFJFQTzOtqwwMLQPVgtjQjqa9KQMDMIAtLYEzzWSz2arbiR0dHdz+8gfobkiKGGBLO6KOQPQVcQHJF2PTCFppaePvMYY/J9UGmbRZMX5GkiYlSS+FOhkHQVATP1/a9YjnOQ8GMd481Do46rqqbOsS+qYMxMiABrEYyR/GoVvyLhnO1GIVlkIwy1bjBluOadT3q9Ub9nLHNMz105LP75B8bofY7HaRzFbxIf3cVsln3w5+Hgq6bHab5PPYubMZmJYD4p8CVsA0pOaIms1mOWsC9rfWYfBqLYvV2moMaBCrxpCWjwgD9C14LuNjJfZ2T08PPfyA42IllkIgizkCYHistAQBzCKA5TJvSya1BXgNeF2yPVskn35D8tBl01uEv7WYTb/pgpv7lQ6uxgR9DDjT4S0k7whiWfBecxALLVLfERKhIl4G9EKMl38dvYgBrMLyEyZMeGvvvffmyqCopH8SjrcHiDcCFMzysTOYQnDqklx2G+Q2kRxWY9mtkGHa5beLze0Um0+J+IjT4XfICt3EkOCWIAJZTz7PH6mqy4CWXInVNUOt3BIMaBBridM0uo2kIyUQxHJYEWzBbKuuCvBchj9AW7Ue+hrWw4Mrj2D5w4ncJjRpjElkRZgXpgnkBcHL1UMV/scOiLgP3Ax01bKFW2LnaPMdJdPTbKswoBdiq5yp+uxsEvdYn9EMYghOL2FlUDU4sS56r7piQ51hPWwR04hnwVhOx0UizSN8CFZzjgAAEABJREFUMcYCkFKoFdRtgncGsd12240RtiZrsI3LSRA11ddKysBwMqBBbDjZ1b5rZgCBi192TmM78eVaGvE/daANljW11B6uOvz4JMVagmlxIarXu1NHSPgyqMtSfj+sDTqiuByqET7AIf+Cc/fhhx/OpeIIj67DKQODZyDeT9Ag7dfmFRmgp6xY2IwFdKa4w38VwYnbiVVNRF0fbWpePVTtcBAVDEKXZ/hRIkSYNiZR1KOH4GUdipRNkQSHAs65NevXaZCps75WVwaGhYHgUzcsXWuncTCQy3H7SgRbREIHFYcN9YwZ2Rj+APAz2NbaUWP7PJ6jVd12rLGvBqv5YsXHv7zkbc6lLXrKWx8BKw/+mWNsIFDgDqaJPHIE00jGdJD39vb24KKJyYbhHJbXF66TaAhkjYkyKkcHAxrERsd5LMwCz4oM4H4Znh9eYwyc6fChMHCDCdqIlYD7MyyQf4Tt22vpauLEifyh4BhWYqXWMQgRvXpjAr6pMSZIG1MsLc5JhGL90Kdpw0AA3yyuO4iF7di2qcHrC0FasHJ3N3bRTV5TG63G1cWABrG66Gr+yvl83vDLqPzwcjVGOZwYCkZgs8Bm/lrH88ccc0x3LX2iTQ5Brymf4wwn3/X2XY1L8o7rhEvCalUL5alUyp2vgqLJE5wjgxdXnQi+psnNVfPqZECDWJ2ENXt1OCQ+43Bm0uEZY3DXP3zgeIMBDR03bhwF8aoxtX15qqenJwenlEJ9tusH6kcCxQOXG6+4PI50OZuKdbQJ56+uINbZ2clmbmWDtk0tOVd+DmgwbWUwY7rVoPZWZkCDWGVuWrIEH1iLVYql8Ujj2YwdViCQuK3LRiXthL1OwOG8ykQt+MpXvuJ+eZ1zLFef+pFA8djlxisujyNdzqZiHW2Cc++7H0plDeA2XaPnfaTaYbXuZsLtRI6JubvPhlPq26hgQIPYqDiNvZPo7u7mcyL+ra0snFMegaEUOehKkYWuGKXlA+VL+4/ypW0ifSRdeUdHRz6TyeThZLrhFHf2zqR6Kp1Ovwm7MwBXEnyuQzBNp8z/vUhJp6UQqcQBearrqwpYzVictxy2Fd05BP9NK2Err4ksghc/D924ZlLVryyt0UoMaBAbrrMVU79f/vKX71u8ePHpCxYsmDF37twZS5Ys6QOUzSjFokWLZkRA2elAvzqluiVLlpxOLFu2bEYFnL506dIZBMpPB0rrUefshK2n33jjjf/7d7/73YlHH330+YcffvgFhxxyyIWUhx566M+mTZt2HtI/Peyww358wAEH/Pi4444741Of+tQXITedccYZM4kzzzzzbMgfAj86/fTTf/yd73znp0ifRyB/PuTPgAtQ70IC6YsioPxiAvlLSkF9MVBeaMc0xrkoAvOlfVNXK6JxZsyYcckMAO0urQdsQ7AftHN20h4C+QuKQC6IC/7xH//x4okTJ+6YPn36OUccccRPDzrooEuPOuqoSw488MCLwffFxx577EWQFyF/0cEHH3wR6vzs4Ycf/vJFF1101urVq9355TkmcI7dOWW6UUR9FMtG+2I79DNj+fLlM1auXDljzpw5p3/hC1+4N6aPpg47TAxoEBsmYuPqFo7mj6eccspiYN43v/nN27/+9a/3wcknnzy3FKwbobSsUj7q92tf+9rtlXDSSSfNJSqVR/pTTz11Dhzv/PHjx5/y4IMP/vCRRx4557HHHvuXf//3fz/n0Ucf/eETTzxxLnQ/Qv5f//CHP/zr5s2brwCu/OxnP/v47OB1A8QNN91003XA1TfffPOVCIpXQHcF8pcjfxnkpcAl0F38/e9//5If/OAHF0eYOXPmRTMB5C8sBfXFQHmhHdMY52Lie9/7ntOX9s06tSIa5+yzz76QQLsLiHPOOefCYlBXDmxDsB+UF+zhnDn3IpAL4pJzzz33YpzjTQhMPyHHuJH4AdIzwfnZ4HsmeD4b5+Js5onf/OY3P9y6devJxx9//PwTTzzRnV+eYyI6n0w3iqiPYtloX1G7r371q/NOOOGEed/+9reX4OboadHXqGJAg9ioOp0tP5mEMaYD26DtkO3YAnISW0IdmFkHdJ0o64R+ErYe34MtLf6nlWh7kjLa1oq2RrnV2A/77bdfeqgAm/hF4SHrr5xd73vf+1LFKFcn1JW1Azb24yDSsd3ee++d7uzs7ACv5L4Nzyj5UyKE4x95dy7wTKkd56Ed52OXqVOnctsaWT2UgXgZ0CAWL/86el8Gin/mwpXAsToZvTEfIoHnaHr9RsQMQiKgmZDTAXthHVbAjYRFGz5jY1ahDMTKgDqBWOnXwUsYKDjTyGGyPEpTEtQRWBEYSsXgGACnPByXSNTSmQawWlgaK3VinqcGsZhPgA7fn4FSR4q7/kKlkrRzvIVCTTTEALYJKwal0nPBAYrPAfMKZSBOBjSIxcm+jl3KQL+gVOwwi9NsCOer1y+JGAKUBqvSfPEQOA/9zlNxuaaVgZFkQJ3ASLLdNGM1pyFwjn0MK833KUQGjrbfMzSo9aiTgUQi4VXjurjLeuoWt9O0MjAcDGgQGw5Wtc9hYQBBy/36CDtnGlKDGEgY7FFtRcugRRSNU3H7saiOJpWBEWFAg9iI0KyD1MJAsaNkmmCwIorbW2sQzIxFuW5rFRPTYNrz+O2F6H6genwC7/wllLpH0wbKwHAwoEFsOFjVPhtiwPN4OQYw8KXW9yWRCOKUgUgk6GiD8omTdkuef+EVZ8/84b+ecMGlVx5y1fXXH3TZ1VcfcMmVV374iiuu2+/Sq6/+YIQrrrtuv0uumvWhy6+99r9ffs01k6+88vopqDv13667bv9/u/baj1x2/fUfJa645poDr7hm1sGQB1963XUfu/yGq6ddfvUN0yJJHXHFrGtQZ9bBl2JMjov6B0J+lAjTByF90DWzZh1ciutmz/4YcfXNN08jrr3xxkOuvv76j191/ezDrppdGdfOuuXQa2fNOvTqm276OHHtjbceQlx9w83T2N81s245+PqbbjooAnUsZ7vr0e91N946/dobbzny2ltuOfKGm35+xKyb5xw++7a5h10/e+FR8xevPNW3xhNwbHHmPEgcTAnPiZXgH8uhxA2EZTUmFcpA7Ax4sVugBigDAzDg+/CX8Kh0m1yRGRfojGzbtsN77k/Pn7RoyZ13zF+0cuOtc5Zvum3O8s1z5q584NYFyx78+e0rHpw7d9VD8+avfmjO7St+PX/Bsodun7vywdvnrfrVbQuX3z93/urNqLP55/NXbJo79w5i85wFK4GlmyA3zZu3fNPtt6/aOG/x8o3z5t25CXLTwoWrNgMou/N+5DcvXLDy/rkLV96/YMmdD0D+imB63qJVvyJuX7DigTnzlz9AGeL+n8+7YzMxb+6yzQTKN81dtGrjvEV3rJ83L8D8+cvXh9iwYMEKh7mLlm1EvU3QbybmLlx6P7FoyaoH5i+688GFi1c+OG/B6ofmLVz9IAHdAwsWr9g8f/GKjXMXrt4wf9GK9QsWr1y/cMGqDfMWLXeYO2/l+nnzl6955OH/e1Y2mzFRkOINgxHeMAgDlpS+jOEtRqlW88pAPAwMHMTisUlHHbsMmNKpmyKN7/vC1ZlQaa107UjLjq5k2xtvml1e2+LvvuV1u+frb8i7kH73li3+3lvesO9++ZUM8U7ICHv1Sb+U3vPll9J7AO8Adgd2C7Er5K4vPL9z1xdf6N6FQHoXgDrmqd/1T3/qKodJ0Bfw3HM7JoXYBdLh2We3T3r22a2TnvvTW5Oe+/MbffDsn16fFGLifz23pRgTkJ/wzLOvFfDUU69MeOrJV8Y7GaQnIl/A00+9OpFgOeQ4lHUC457848sT/vjkC5Oe/ONzk95+a6sn1kh7exC4QLNY/BPxSk+HyxtjnNQ3ZaAZGCh/lTaDZWqDMgAGEKuwpSUOyLrDGCMmmZT2zomSzbXJzp6E7NjpObmzJyld3R6QcPlUpkNSmXagkuxEWWVkcuMlnR1XAPNEsa40ncpU7q9PWZb1aFd19KTbJUIKc4rSmdw4GQhpjBGB7YqRziQFRErO4hGX8SSbzUv08kwSIcxE2T7SGFTuo9GMMhAfAxrE4uNeRy7PQB8tgxhXBnCcQrCQqzGbz4vvWzFtneK1jROTGCeJ9vGSbJ/oJPMm2SnWdIj12itLltUB37QF/YVtJNEhA4E2RKCdfZCcIF5ykniJXSsikdxNiGTb7kIwTTBNeG27yEBItO8qEcrVM5hHLocgZj2scsGuBYwRbt0iFUinY06hDDQfAxrEmu+cqEVFDJjwCs3nscGFiGa8pCCaCaKS5LGCyEGfhZPNi5VI5tEIG48ub5LYIku2SUWZaBNheQVpTUJ8LyHFMujfE8pifWm94rx4yT79MG8TSfTbLr5pb0hatMtJUqohaxPgItGvnm89SfAmwAVi8AAOTMJzgQtsCyFlXsaYMlpVKQPxMODFM6yOqgyUY8Dr5x1L/SVXYcagWiIhySQCmmfFJA1ighFB2hpfJCFOZ5HP+VnJA5VlGuVpyfnpslK8PFZe2GarIDleP0hefMASsIflzBcjb3NC+KjpI1z41iIFlMgcVpx5Py+RzGNZWqiPui6gk48BYDxPykG8hGSwhZhJ50SwqoVBYtG/iCciBu8gUvq/jDH9la2uUftblgFerS1rvBo+WhlAIDLWTY4+lT6zvZ1/BSS4XLEAE8QHyWV98VkBNX36VaS5OqMjtggMQifvoYAdNCj9sJ9K0ob9Ogk7LIaTovGcHnmnj8opw36DWcJatoPO1cMEoRGBFOoJNw4ahpL9WtBBu3yEPx9t/XISffg2L34ki+shwCZwM5BowyosSX7RP+4AqGOK/VGWQWB2mQJVKQMjzQA+BiM9pI6nDJRnwKODhiP2PG5p9a2TyWQCheElC3gJMdjqSxhsyeWsGEQxg7Rxnt2IgTNmujqSYuwgkPfERPBhUykqlUVjisBWH8AcMHcjkAjgxkAfyUgfSQQlg6BkKFk/0peTRf2AViHFJqwneEU3AYIVn8AKQeDPu7S4lzHowKXwFiaNgWHI6qEMNAMDXjMY0ZgN2koZIAO4hLl8iQuC8RsG7R8s/LCD+iV2W8XnTQEDfxigws5CYUNZKtiyVKd5ZSAeBvgJjGdkHVUZ6MdADXf4dLh9gka/TupS0HcPBnUN1q8yPn6WozcuDfhoFJE5WMSGSQQtw2BIIB1quUCLkgLusRJjhV6VppSBGBnApyfG0XVoZWDQDMCfMvY1CqGzrh14UAWLi+tjfBkM2J3BGw4X0OqVYVs0a/yI7A976NMl5xrqo6RxkS5UqlAG4mVAg1i8/Ovog2IAztf5U8hBBZJBtDd5kYYRRQV+DBuBhC9GnUaAZ4/gz8VONvfAA6XrFWlwWsgWEiKGD9VEX8pAczDAT05zWKJWKAPBMqcOHuK9fJ3zr8Pa/lUZKKilbARsSzAYNgKOifZcxboVKdIVDlclLDMmGfGct9kAAAmRSURBVDYMFSqGmQHtfiAG4vUCA1mmZWORAXriGuaNZQGeBbGilSTcr4c1g+ekxTMbAShrgkG7BsFxiJrGqWQTooNtFPzuGlaB1q2mfKlX+mgnYI481gwswzxdidVMl1YcfgY0iA0/xzrCYBmoKbSZcBTKOsDl1CBgpY6x+tWNTPZFGFDqhUQvtHfJeqVr1PtmkQwRCqGENjiQ4Ww94b5joNJ3ZSBuBjSIDc8Z0F4bYCCRwJIEXpJfzIW/dA4UmoLr7+0SpXT4bhXho9wP1jmojFWCYLEgBq1rgaDNYFDLGJXrCOwEsKo0DUIw81phEayJ0vqkQKy4RRnTBsnosCSTGV8wkhF+jyzn88cWqVQoA/EzoEEs/nOgFtTBANxoWJvbZ4IgAO8qfBXLKE39WED0Ma5XFnFjA2bZA1EoCfXMU49VGIKZC3lUKZSB2BngdRm7EWqAMqAMDAEDw9yF+yksjBEtzpDUQxmInQENYrGfAjVAGWgxBoy6jRY7Y6PaXL0aR/XpbbnJBXtaLWf22DI4oUFsbJ3wgWcbe6kGsdhPgRqgDLQOAwZPIQ1erWOxWjraGdAgNtrPsM5PGRhiBkzCmCHuUrtTBhpmQINYw9S1bsMmtlydYxOfnMg0a7EcizIqlYGYGdAgFvMJ0OHLM1Dvvb6FZ41QvkfVFjNgjBFjjFORN5cI3wJtlOnNGeE33hDBLP+XfViuQhmImQENYjGfAB2+lwGDV29OU03LAKNZ3cZpA2VgeBjQIDY8vGqvysDoZUBvNkbvuW3BmWkQa8GTpiYrA3EwEH3Z2dOVWBz065gVGBgoiFVoomplQBkYMwzgWWPpXD0vUarSvDIQGwMaxGKjXgdWBlqTAV2IteZ5G61WaxAbrWe2Veeldjc9A/o9saY/RWPKQA1iY+p0t8BkLWwkIMod/MOP4v4Ei4ixvv6cugzuRQ57e/Acs76hxhcp/LkbwYuugkBSD2WgiRjQq7KJTsZYNyVhEuI5B1rEBPI+ghoOMZ4n/HtWAlfb0QaHa3PIWrFoJ17wF56t5XeZPOgoJZAG6Upw331CeaPSYKxG2w5BuyKm6kryu2HGz4vNZ6WNz7h8cAserXhgV6StHcSzRxJPQC8m6cpyeZ8lowk6lxZmwGth29X0UceAde4ydJ9udtR47ir1xPq+jBs/Hnpf0ukeaU8mEQZEjM07wCOLwM0aAjrmo7KKUiz6aBywSjwYbBrsR7CaHAhV+0V70yhgc3syKflcBryBZK9NJJkQECK5nBW+MDVmmRRxNwhM8qxQKpSB+Bnw4jdBLVAGehmg6yR6NSKIXYVsJkOHy6yFo80JXLAk4MSJpNhCulyeuv7IoU3jSPo5GQzaEGwHQrW+EwLbG4RBu3y2R4zJC4gEqZBYmYFGYZhqQ0yDEocHCNTBmTGGf//ZqfRNGYidgeDqjN2M+g3QFqOSgcBLFk0tWIWJtMGjJhIJBLS8JLB6GDduvOQy3VhF9Eg+u1389Dbkt4nNbHcyyg+ndH2nt0oO8DPbJE8gzXy+Rhm1qySr9cOxGsd2yWZ3ivWzAtIEZDrmk21GyHsWail6RSfH8zSIFdGiyZgZ8GIeX4dXBgoMYLeqkI4SiUSwHMjCo+bzeThcH742Jz093bL7bpOyEzvz3RM6st3jOzI7IXdO6Mx2jW/PdCG/Y2JHtgv5SHaF+T5yfEcKdVNd4zpSaJ/aWSyjsipyhytvTzk5oSO9Y0JnugsSYxfkDuR3QN9PjmvfuSNEV2f7zi6k+8jxHd2wr3tnsRwX6LooO9t6dkQY19azvRTj21PbgW1l8Oa4zvTrnZ3+m5Mmtm0X49tkZ7sYz5Nc1goel0kQqugiPKzCuLEYnpUEsmFShTIQNwO8QuO2QcdXBiIGopv9KC8MXoUMEm3JNkliRbbb7rvmzzn7rG9vXLdi8oZf3jH13ruB+5ZOWXvf0qn3rV82dd0vlu2/DmnkIzk1zPeR69Yvn3rffcun3rt++ZR77wOKJPVROeW6dXdMWXPvHVPWrQvkxrVLJwNTgMkb1i0tlSyjnnIKy9ffs2TyfWuWTC6W69fcMXkDAPnhjWvu+PDGdcsnbwYo1923csoaYO19Kyevu3vV1Hs3rJpCGekp712/aur9966Ysmnt8skb1y6HDcunrL9nGca42+XR9xRgKrFp3fL9CabvuW/V/vesu/Mj6x+4a8r/+s6M/2kSNpvDc0Y+d2S4IjzT1z0gtOEM+GLE/bdFpPVQBuJnoO9VGr89asHYZgBBzPRhwMPKoKOjQxIIXMYYyeayksvnZOeOHfkDDzzwiWnT9n/x8MMnP3/EEVNeOArpAo7a/8VCulg/iPQnPn7AX4px2GEffakeTJ9+4MvVUNxf8VhHRfOBLNYzzTbF/R555MGvHHnkh18p1jHNegTTn/z4/n8ljvjoR7d84EMfeNrmMzkRX4rXWD6eNfaeDJyaMIPdxN5MqFOhDMTFgAaxuJjXcWtmIJ1OC7cSk3gWxkbJRFKstYlUqifYa6RS0TADST/fgQdiCW4lshPcK1AAdA8eV15I80CQ00UYiRhR6GADM+ANXKylysDIMcAgheAkxhgEqWBc3/ddXrBKyGbTSFvJ+1kxnpU2DWEBSYN8z+VSCax/EyZcefF/JrqlloFWDJh3OTGGeQzmeWECaT2UgZgZ0CAW8wnQ4RtmIPCsDTfXhhED4QK3KDAxWdk1oLRyYdSpSmVghBjQi3E4iNY+G2IAqzC/ekNW8YWrBtTXQFadsKo1jAn2CLkC61fZFflQhwDjxor6DTCiR3MwoBdjc5wHtQIM1BuUTM5gUYCGegyKgURnB5lEeAq6wXkIEoV3HykCAocxnvoN8KBHczCgF2NznAe1ggx4XoJiIGAVgFUYahjf5hDFkNIjYKDh9zZpyxuTsMFKjC6BEDyXZFzrDV7QCO8ajNigQsMjakNlYOgY0Itx6LjUngbJgK3POVrP0/9gMEjKXfNkMslo5dLGMEyJGEPJAFYoksLLV94LXGgidgY0iMV+CtSAiAH4TSMG9/tApIskVYRbhhnnWA1fUbnKxhlIJBKeMfwPinAH5RZZIB6HEG4UI6go+lIGRJqAA70Ym+AkqAkhA7bXT4aagQR9atXtx4E60LKAgfBmgHyKuP/IIXhxFYYbCotk6WGCnwsuVWteGYiDAQ1icbCuY5ZlwBODxy0iwUJL+rzoSwOwCuEZ3/e9PpU00xADHrZlPcckA1eA8AEZzghiG4jHIVbIu1jf2kRDA2kjZWAYGPj/AAAA//+SgPIBAAAABklEQVQDAF33czVtLzdSAAAAAElFTkSuQmCC'
};
/* ───────────── Checkered Flag SVG Pattern ───────────── */
// SVG pattern for checkered flag (like GitHub contribution grid but with F1 theme)
const CHECKERED_FLAG_PATTERN = `
	<defs>
		<pattern id="checkered-flag" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
			<rect x="0" y="0" width="5" height="5" fill="white"/>
			<rect x="5" y="0" width="5" height="5" fill="black"/>
			<rect x="0" y="5" width="5" height="5" fill="black"/>
			<rect x="5" y="5" width="5" height="5" fill="white"/>
		</pattern>
	</defs>
`;


/***/ },

/***/ "./src/pacman/core/game.ts"
/*!*********************************!*\
  !*** ./src/pacman/core/game.ts ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Game: () => (/* binding */ Game),
/* harmony export */   determineGhostName: () => (/* binding */ determineGhostName)
/* harmony export */ });
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _movement_ghosts_movement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../movement/ghosts-movement */ "./src/pacman/movement/ghosts-movement.ts");
/* harmony import */ var _movement_pacman_movement__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../movement/pacman-movement */ "./src/pacman/movement/pacman-movement.ts");
/* harmony import */ var _renderers_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../renderers/svg */ "./src/pacman/renderers/svg.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constants */ "./src/pacman/core/constants.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





/* ---------- positioning helpers ---------- */
const placePacman = (store) => {
    store.pacman = {
        x: 0,
        y: 0,
        direction: 'right',
        points: 0,
        totalPoints: 0,
        deadRemainingDuration: 0,
        powerupRemainingDuration: 0,
        recentPositions: [],
        ghostsEaten: 0
    };
};
const placeGhosts = (store) => {
    store.ghosts = [
        {
            x: 26,
            y: 2,
            name: 'blinky',
            direction: 'left',
            scared: false,
            target: undefined,
            inHouse: false,
            respawnCounter: 0,
            freezeCounter: 0,
            justReleasedFromHouse: false
        },
        {
            x: 25,
            y: 3,
            name: 'inky',
            direction: 'up',
            scared: false,
            target: undefined,
            inHouse: true,
            respawnCounter: 0,
            freezeCounter: 10,
            justReleasedFromHouse: false
        },
        {
            x: 26,
            y: 3,
            name: 'pinky',
            direction: 'down',
            scared: false,
            target: undefined,
            inHouse: true,
            respawnCounter: 0,
            freezeCounter: 20,
            justReleasedFromHouse: false
        },
        {
            x: 27,
            y: 3,
            name: 'clyde',
            direction: 'up',
            scared: false,
            target: undefined,
            inHouse: true,
            respawnCounter: 0,
            freezeCounter: 30,
            justReleasedFromHouse: false
        }
    ];
    store.ghosts.forEach((g) => {
        g.justReleasedFromHouse = false;
        g.respawnCounter = 0;
        if (g.inHouse) {
            if (g.name === 'inky')
                g.direction = 'up';
            else if (g.name === 'pinky')
                g.direction = 'down';
            else if (g.name === 'clyde')
                g.direction = 'up';
        }
    });
};
/* ---------- main cycle ---------- */
const stopGame = (store) => __awaiter(void 0, void 0, void 0, function* () {
    clearInterval(store.gameInterval);
});
const startGame = (store) => __awaiter(void 0, void 0, void 0, function* () {
    store.frameCount = 0;
    store.aliveSteps = 0;
    store.gameHistory = [];
    store.ghosts.forEach((g) => (g.scared = false));
    _movement_ghosts_movement__WEBPACK_IMPORTED_MODULE_1__.GhostsMovement.resetGameMode();
    store.grid = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.createGridFromData(store);
    const remainingCells = () => store.grid.some((row) => row.some((cell) => cell.commitsCount > 0));
    if (remainingCells()) {
        placePacman(store);
        placeGhosts(store);
    }
    const MAX_FRAMES = 30000;
    while (remainingCells() && store.frameCount < MAX_FRAMES) {
        yield updateGame(store);
    }
    yield updateGame(store);
});
/* ---------- utilities ---------- */
const resetPacman = (store) => {
    store.pacman.x = 27;
    store.pacman.y = 7;
    store.pacman.direction = 'right';
    store.pacman.recentPositions = [];
};
const determineGhostName = (index) => {
    const names = ['blinky', 'inky', 'pinky', 'clyde'];
    return names[index % names.length];
};
/* ---------- update per frame ---------- */
const updateGame = (store) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    store.frameCount++;
    if (store.pacman.deadRemainingDuration > 0) {
        store.pacman.deadRemainingDuration--;
        if (store.pacman.deadRemainingDuration === 0) {
            resetPacman(store);
            placeGhosts(store);
        }
    }
    if (store.pacman.powerupRemainingDuration > 0) {
        store.pacman.powerupRemainingDuration--;
        if (store.pacman.powerupRemainingDuration === 0) {
            store.ghosts.forEach((g) => {
                var _a, _b;
                if (g.name === 'eyes')
                    return;
                const atBoundary = ((_a = g.subX) !== null && _a !== void 0 ? _a : 0) === 0 && ((_b = g.subY) !== null && _b !== void 0 ? _b : 0) === 0;
                if (atBoundary) {
                    g.scared = false;
                }
            });
            store.pacman.points = 0;
        }
    }
    store.ghosts.forEach((ghost) => {
        if (ghost.inHouse && ghost.respawnCounter && ghost.respawnCounter > 0) {
            ghost.respawnCounter--;
            if (ghost.respawnCounter === 0) {
                ghost.name = ghost.originalName || determineGhostName(store.ghosts.indexOf(ghost));
                ghost.inHouse = false;
                ghost.scared = store.pacman.powerupRemainingDuration > 0;
                ghost.justReleasedFromHouse = true;
            }
        }
        if (ghost.freezeCounter) {
            ghost.freezeCounter--;
            if (ghost.freezeCounter === 0) {
                releaseGhostFromHouse(store, ghost.name);
            }
        }
    });
    const remaining = store.grid.some((row) => row.some((c) => c.commitsCount > 0));
    if (!remaining) {
        const svg = _renderers_svg__WEBPACK_IMPORTED_MODULE_3__.SVG.generateAnimatedSVG(store);
        store.config.svgCallback(svg);
        if (store.config.gameStatsCallback) {
            store.config.gameStatsCallback({
                totalScore: store.pacman.totalPoints,
                steps: store.aliveSteps,
                ghostsEaten: (_a = store.pacman.ghostsEaten) !== null && _a !== void 0 ? _a : 0
            });
        }
        store.config.gameOverCallback();
        return;
    }
    _movement_pacman_movement__WEBPACK_IMPORTED_MODULE_2__.PacmanMovement.movePacman(store);
    checkCollisions(store);
    if (store.pacman.deadRemainingDuration === 0) {
        _movement_ghosts_movement__WEBPACK_IMPORTED_MODULE_1__.GhostsMovement.moveGhosts(store);
        checkCollisions(store);
    }
    store.pacmanMouthOpen = !store.pacmanMouthOpen;
    if (store.pacman.deadRemainingDuration === 0) {
        store.aliveSteps++;
    }
    if (store.config.gameStatsCallback) {
        store.config.gameStatsCallback({
            totalScore: store.pacman.totalPoints,
            steps: store.aliveSteps,
            ghostsEaten: (_b = store.pacman.ghostsEaten) !== null && _b !== void 0 ? _b : 0
        });
    }
    pushSnapshot(store);
});
/* ---------- snapshot helper ---------- */
const pushSnapshot = (store) => {
    store.gameHistory.push({
        pacman: {
            x: store.pacman.x,
            y: store.pacman.y,
            direction: store.pacman.direction,
            powerupRemainingDuration: store.pacman.powerupRemainingDuration
        },
        ghosts: store.ghosts.map((g) => ({
            x: g.x,
            y: g.y,
            subX: g.subX,
            subY: g.subY,
            name: g.name,
            direction: g.direction,
            scared: g.scared
        })),
        grid: store.grid.map((row) => row.map((col) => ({ color: col.color })))
    });
};
/* ---------- collisions & house ---------- */
const checkCollisions = (store) => {
    if (store.pacman.deadRemainingDuration)
        return;
    store.ghosts.forEach((ghost) => {
        var _a;
        if (ghost.name === 'eyes')
            return;
        if (ghost.x === store.pacman.x && ghost.y === store.pacman.y) {
            if (store.pacman.powerupRemainingDuration && ghost.scared) {
                ghost.originalName = ghost.name;
                ghost.name = 'eyes';
                ghost.scared = false;
                ghost.target = { x: 26, y: 3 };
                ghost.subX = 0;
                ghost.subY = 0;
                store.pacman.points += 10;
                store.pacman.ghostsEaten = ((_a = store.pacman.ghostsEaten) !== null && _a !== void 0 ? _a : 0) + 1;
            }
            else {
                store.pacman.points = 0;
                store.pacman.powerupRemainingDuration = 0;
                if (store.pacman.deadRemainingDuration === 0) {
                    store.pacman.deadRemainingDuration = _constants__WEBPACK_IMPORTED_MODULE_4__.PACMAN_DEATH_DURATION;
                }
            }
        }
    });
};
const releaseGhostFromHouse = (store, name) => {
    const ghost = store.ghosts.find((g) => g.name === name && g.inHouse);
    if (ghost) {
        ghost.justReleasedFromHouse = true;
        ghost.y = 2;
        ghost.direction = 'up';
    }
};
const Game = {
    startGame,
    stopGame
};


/***/ },

/***/ "./src/pacman/core/store.ts"
/*!**********************************!*\
  !*** ./src/pacman/core/store.ts ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Store: () => (/* binding */ Store)
/* harmony export */ });
const Store = {
    frameCount: 0,
    aliveSteps: 0,
    contributions: [],
    pacman: {
        x: 0,
        y: 0,
        direction: 'right',
        points: 0,
        totalPoints: 0,
        deadRemainingDuration: 0,
        powerupRemainingDuration: 0,
        recentPositions: [],
        ghostsEaten: 0
    },
    ghosts: [],
    grid: [],
    monthLabels: [],
    pacmanMouthOpen: true,
    gameInterval: 0,
    gameHistory: [],
    config: undefined,
    useGithubThemeColor: true
};


/***/ },

/***/ "./src/pacman/index.ts"
/*!*****************************!*\
  !*** ./src/pacman/index.ts ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PacmanRenderer: () => (/* binding */ PacmanRenderer),
/* harmony export */   PlayerStyle: () => (/* reexport safe */ _types__WEBPACK_IMPORTED_MODULE_4__.PlayerStyle)
/* harmony export */ });
/* harmony import */ var _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shared/providers/providers */ "./src/shared/providers/providers.ts");
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _core_game__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/game */ "./src/pacman/core/game.ts");
/* harmony import */ var _core_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/store */ "./src/pacman/core/store.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./types */ "./src/pacman/types.ts");
/* harmony import */ var _utils_grid__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/grid */ "./src/pacman/utils/grid.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};







class PacmanRenderer {
    constructor(conf) {
        this.conf = Object.assign({}, conf);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultConfig = {
                platform: 'github',
                username: '',
                svgCallback: (_) => { },
                gameOverCallback: () => { },
                gameTheme: 'github',
                pointsIncreasedCallback: (_) => { },
                githubSettings: { accessToken: '' },
                playerStyle: _types__WEBPACK_IMPORTED_MODULE_4__.PlayerStyle.OPPORTUNISTIC
            };
            this.store = JSON.parse(JSON.stringify(_core_store__WEBPACK_IMPORTED_MODULE_3__.Store));
            this.store.config = Object.assign(Object.assign({}, defaultConfig), this.conf);
            switch (this.store.config.platform) {
                case 'gitlab':
                    this.store.contributions = yield _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__.Providers.fetchGitlabContributions(this.store);
                    break;
                case 'github':
                    this.store.contributions = yield _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__.Providers.fetchGithubContributions(this.store);
                    break;
                default:
                    throw new Error(`Unsupported platform: ${this.store.config.platform}`);
            }
            _utils_grid__WEBPACK_IMPORTED_MODULE_5__.Grid.buildWalls();
            _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.buildGrid(this.store);
            _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.buildMonthLabels(this.store);
            yield _core_game__WEBPACK_IMPORTED_MODULE_2__.Game.startGame(this.store);
            return this.store;
        });
    }
    stop() {
        _core_game__WEBPACK_IMPORTED_MODULE_2__.Game.stopGame(this.store);
    }
}


/***/ },

/***/ "./src/pacman/movement/ghosts-movement.ts"
/*!************************************************!*\
  !*** ./src/pacman/movement/ghosts-movement.ts ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GhostsMovement: () => (/* binding */ GhostsMovement)
/* harmony export */ });
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/constants */ "./src/pacman/core/constants.ts");
/* harmony import */ var _movement_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./movement-utils */ "./src/pacman/movement/movement-utils.ts");


// Constants for ghost behavior
const SCATTER_MODE_DURATION = 7; // Duration of "scatter" mode in seconds (frames)
const CHASE_MODE_DURATION = 20; // Duration of "chase" mode in seconds (frames)
const SCATTER_CORNERS = {
    blinky: { x: _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - 3, y: 0 },
    pinky: { x: 0, y: 0 },
    inky: { x: _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - 3, y: _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - 1 },
    clyde: { x: 0, y: _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - 1 } // Bottom left corner
};
// Global status of game modes
let currentMode = 'scatter';
let modeTimer = 0;
let dotsRemaining = 0;
const resetGameMode = () => {
    currentMode = 'scatter';
    modeTimer = 0;
    dotsRemaining = 0;
};
const moveGhosts = (store) => {
    // Calculate the total number of points remaining to define the behavior
    dotsRemaining = countRemainingDots(store);
    // Update game mode (scatter or chase)
    updateGameMode(store);
    for (const ghost of store.ghosts) {
        // Special logic for ghosts inside the house
        if (ghost.inHouse) {
            moveGhostInHouse(ghost, store);
            continue;
        }
        if (ghost.name === 'eyes') {
            ghost.scared = false;
        }
        // Main movement logic
        if (ghost.scared) {
            moveScaredGhost(ghost, store);
        }
        else if (ghost.name === 'eyes') {
            moveEyesToHome(ghost, store);
        }
        else {
            // Choose behavior based on current mode
            if (currentMode === 'scatter') {
                moveGhostToScatterTarget(ghost, store);
            }
            else {
                moveGhostWithPersonality(ghost, store);
            }
        }
    }
};
// Function to count remaining points on the grid
const countRemainingDots = (store) => {
    let count = 0;
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH; x++) {
        for (let y = 0; y < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT; y++) {
            if (store.grid[x][y].level !== 'NONE') {
                count++;
            }
        }
    }
    return count;
};
// Updates game mode between "scatter" and "chase"
const updateGameMode = (store) => {
    // If Pac-Man is powered up, do not change the mode
    if (store.pacman.powerupRemainingDuration > 0)
        return;
    // Increment the current mode timer
    modeTimer++;
    // Check if it's time to change mode
    const modeDuration = currentMode === 'scatter' ? SCATTER_MODE_DURATION : CHASE_MODE_DURATION;
    if (modeTimer >= modeDuration * (1000 / 200)) {
        // Converting to frames (assuming 200ms per frame)
        // Switch between scatter and chase
        currentMode = currentMode === 'scatter' ? 'chase' : 'scatter';
        modeTimer = 0;
        // Reverse ghost direction when changing mode
        store.ghosts.forEach((ghost) => {
            if (!ghost.inHouse && ghost.name !== 'eyes' && !ghost.scared) {
                reverseDirection(ghost);
            }
        });
    }
};
// Function to reverse the direction of a ghost
const reverseDirection = (ghost) => {
    switch (ghost.direction) {
        case 'up':
            ghost.direction = 'down';
            break;
        case 'down':
            ghost.direction = 'up';
            break;
        case 'left':
            ghost.direction = 'right';
            break;
        case 'right':
            ghost.direction = 'left';
            break;
    }
};
const moveGhostInHouse = (ghost, store) => {
    // If the ghost is being released, allow it to leave the house.
    if (ghost.justReleasedFromHouse) {
        // The ghost can only leave through the door, which is at position x=26
        if (ghost.x === 26) {
            ghost.y = 2; // Door position
            ghost.direction = 'up';
            ghost.inHouse = false;
            ghost.justReleasedFromHouse = false;
        }
        else {
            // If not in the door position, move towards it.
            if (ghost.x < 26) {
                ghost.x += 1;
                ghost.direction = 'right';
            }
            else if (ghost.x > 26) {
                ghost.x -= 1;
                ghost.direction = 'left';
            }
        }
        return;
    }
    // If the ghost is in the process of respawn, just decrement the counter
    if (ghost.respawnCounter && ghost.respawnCounter > 0) {
        ghost.respawnCounter--;
        // When the counter reaches zero, restore the ghost
        if (ghost.respawnCounter === 0) {
            if (ghost.originalName) {
                ghost.name = ghost.originalName;
                ghost.inHouse = false;
                ghost.scared = store.pacman.powerupRemainingDuration > 0;
            }
        }
        return;
    }
    // Vertical movement inside the house
    const topWall = 3; // The position y=2 is where the door is
    const bottomWall = 4;
    // If it is going up and hits the upper limit
    if (ghost.direction === 'up' && ghost.y <= topWall) {
        ghost.direction = 'down';
        ghost.y = topWall; // Make sure it doesn't go over the wall
    }
    // If it is going down and hits the lower limit
    else if (ghost.direction === 'down' && ghost.y >= bottomWall - 1) {
        ghost.direction = 'up';
        ghost.y = bottomWall - 1; // Make sure it doesn't go over the wall
    }
    // Apply movement in the current direction (discrete movement instead of fractional)
    if (ghost.direction === 'up') {
        ghost.y -= 1; // Move up in whole increments
    }
    else {
        ghost.y += 1; // Move down in whole increments
    }
    // If the move resulted in an invalid position, reverse
    if (ghost.y < topWall || ghost.y >= bottomWall) {
        // Revert to previous position
        ghost.y = ghost.direction === 'up' ? topWall : bottomWall - 1;
        // Change direction
        ghost.direction = ghost.direction === 'up' ? 'down' : 'up';
    }
};
// Move to "scatter" mode - each ghost goes to its corner
const moveGhostToScatterTarget = (ghost, store) => {
    const target = SCATTER_CORNERS[ghost.name] || SCATTER_CORNERS['blinky'];
    ghost.target = target;
    // At the corner, step to an adjacent cell so BFS loops the ghost back next frame
    if (ghost.x === target.x && ghost.y === target.y) {
        const moves = _movement_utils__WEBPACK_IMPORTED_MODULE_1__.MovementUtils.getValidMoves(ghost.x, ghost.y);
        if (moves.length > 0) {
            const [dx, dy] = moves[0];
            ghost.x += dx;
            ghost.y += dy;
            if (dx > 0)
                ghost.direction = 'right';
            else if (dx < 0)
                ghost.direction = 'left';
            else if (dy > 0)
                ghost.direction = 'down';
            else if (dy < 0)
                ghost.direction = 'up';
        }
        return;
    }
    const nextMove = BFSTargetLocation(ghost.x, ghost.y, target.x, target.y, ghost.direction);
    if (nextMove) {
        ghost.x = nextMove.x;
        ghost.y = nextMove.y;
        if (nextMove.direction) {
            ghost.direction = nextMove.direction;
        }
    }
};
// When scared, ghosts move randomly but with some intelligence
const moveScaredGhost = (ghost, store) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    // Ghosts move at half speed during power-up (one cell per two frames)
    const SCARED_SPEED = 0.5;
    const subX = (_a = ghost.subX) !== null && _a !== void 0 ? _a : 0;
    const subY = (_b = ghost.subY) !== null && _b !== void 0 ? _b : 0;
    const atBoundary = subX === 0 && subY === 0;
    if (!atBoundary) {
        const dirX = subX > 0 ? 1 : subX < 0 ? -1 : 0;
        const dirY = subY > 0 ? 1 : subY < 0 ? -1 : 0;
        ghost.subX = subX + dirX * SCARED_SPEED;
        ghost.subY = subY + dirY * SCARED_SPEED;
        if (((_c = ghost.subX) !== null && _c !== void 0 ? _c : 0) >= 1) {
            ghost.x += 1;
            ghost.subX = 0;
        }
        else if (((_d = ghost.subX) !== null && _d !== void 0 ? _d : 0) <= -1) {
            ghost.x -= 1;
            ghost.subX = 0;
        }
        if (((_e = ghost.subY) !== null && _e !== void 0 ? _e : 0) >= 1) {
            ghost.y += 1;
            ghost.subY = 0;
        }
        else if (((_f = ghost.subY) !== null && _f !== void 0 ? _f : 0) <= -1) {
            ghost.y -= 1;
            ghost.subY = 0;
        }
        const nowAtBoundary = ((_g = ghost.subX) !== null && _g !== void 0 ? _g : 0) === 0 && ((_h = ghost.subY) !== null && _h !== void 0 ? _h : 0) === 0;
        if (nowAtBoundary && store.pacman.powerupRemainingDuration === 0) {
            ghost.scared = false;
        }
        return;
    }
    if (store.pacman.powerupRemainingDuration === 0) {
        ghost.scared = false;
        return;
    }
    // Check if you already have a target or if you have already reached the current target
    if (!ghost.target || (ghost.x === ghost.target.x && ghost.y === ghost.target.y)) {
        ghost.target = getRandomDestination(ghost.x, ghost.y);
    }
    const validMoves = getValidMovesWithoutReverse(ghost);
    if (validMoves.length === 0)
        return;
    // Move toward target but with some randomness to appear "scared"
    const dx = ghost.target.x - ghost.x;
    const dy = ghost.target.y - ghost.y;
    // Filter moves that generally go toward the target but with randomness
    let possibleMoves = validMoves;
    // 50% chance to choose a completely random move
    if (Math.random() < 0.5) {
        // Choose any valid move
    }
    else {
        // Try to choose a move that goes in the direction of the target.
        const goodMoves = validMoves.filter((move) => {
            const moveX = move[0];
            const moveY = move[1];
            return (dx > 0 && moveX > 0) || (dx < 0 && moveX < 0) || (dy > 0 && moveY > 0) || (dy < 0 && moveY < 0);
        });
        // If there are "good" moves, use them.
        if (goodMoves.length > 0) {
            possibleMoves = goodMoves;
        }
    }
    // Choose a random move from the possible moves
    const [moveX, moveY] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    // Update ghost direction based on movement
    if (moveX > 0)
        ghost.direction = 'right';
    else if (moveX < 0)
        ghost.direction = 'left';
    else if (moveY > 0)
        ghost.direction = 'down';
    else if (moveY < 0)
        ghost.direction = 'up';
    ghost.subX = moveX * SCARED_SPEED;
    ghost.subY = moveY * SCARED_SPEED;
};
// Function to get valid moves that are not reversals of the current direction
const getValidMovesWithoutReverse = (ghost) => {
    const validMoves = _movement_utils__WEBPACK_IMPORTED_MODULE_1__.MovementUtils.getValidMoves(ghost.x, ghost.y);
    // Do not allow the ghost to reverse its direction unless it is the only way
    return validMoves.filter((move) => {
        const [dx, dy] = move;
        // Checks whether the movement would be a reversal of the current direction
        if ((ghost.direction === 'right' && dx < 0) ||
            (ghost.direction === 'left' && dx > 0) ||
            (ghost.direction === 'up' && dy > 0) ||
            (ghost.direction === 'down' && dy < 0)) {
            return false;
        }
        return true;
    });
};
// Special movement for eyes to return home
const moveEyesToHome = (ghost, store) => {
    const respawnPosition = { x: 26, y: 3 }; // Center of the ghost house
    // Check if you are already close to/inside the house
    if (Math.abs(ghost.x - respawnPosition.x) <= 1 && Math.abs(ghost.y - respawnPosition.y) <= 1) {
        // Adjust to the exact respawn position and start the respawn process
        ghost.x = respawnPosition.x;
        ghost.y = respawnPosition.y;
        ghost.inHouse = true;
        ghost.respawnCounter = 1; // Time to respawn
        return;
    }
    // Eyes move faster than normal ghosts
    const nextMove = _movement_utils__WEBPACK_IMPORTED_MODULE_1__.MovementUtils.findNextStepDijkstra({ x: ghost.x, y: ghost.y }, respawnPosition);
    if (nextMove) {
        // Calculate direction based on movement
        const dx = nextMove.x - ghost.x;
        const dy = nextMove.y - ghost.y;
        // Update direction based on actual movement
        if (dx > 0)
            ghost.direction = 'right';
        else if (dx < 0)
            ghost.direction = 'left';
        else if (dy > 0)
            ghost.direction = 'down';
        else if (dy < 0)
            ghost.direction = 'up';
        // Update position
        ghost.x = nextMove.x;
        ghost.y = nextMove.y;
    }
    else {
        // If you can't find a path, use BFSTargetedLocation as a fallback
        const alternativeMove = BFSTargetLocation(ghost.x, ghost.y, respawnPosition.x, respawnPosition.y, ghost.direction);
        if (alternativeMove) {
            ghost.x = alternativeMove.x;
            ghost.y = alternativeMove.y;
            if (alternativeMove.direction) {
                ghost.direction = alternativeMove.direction;
            }
        }
    }
};
// Specific movement for each ghost personality
const moveGhostWithPersonality = (ghost, store) => {
    // If the ghost is respawning (eyes only), use expert logic
    if (ghost.name === 'eyes') {
        moveEyesToHome(ghost, store);
        return;
    }
    // Target calculation based on ghost personality
    const target = calculateGhostTarget(ghost, store);
    ghost.target = target;
    // Finds the next move using BFS, respecting no-reversal rules
    const nextMove = BFSTargetLocation(ghost.x, ghost.y, target.x, target.y, ghost.direction);
    if (nextMove) {
        ghost.x = nextMove.x;
        ghost.y = nextMove.y;
        if (nextMove.direction) {
            ghost.direction = nextMove.direction;
        }
    }
};
// Improved version of BFS that respects the no-reversion rule
const BFSTargetLocation = (startX, startY, targetX, targetY, currentDirection) => {
    // If we are already on target, no need to move
    if (startX === targetX && startY === targetY)
        return null;
    const queue = [{ x: startX, y: startY, path: [], direction: currentDirection || 'right' }];
    const visited = new Set();
    visited.add(`${startX},${startY}`);
    while (queue.length > 0) {
        const current = queue.shift();
        const { x, y, path, direction } = current;
        // Get valid moves
        const validMoves = _movement_utils__WEBPACK_IMPORTED_MODULE_1__.MovementUtils.getValidMoves(x, y);
        // Filter out moves that would reverse the current direction
        const filteredMoves = validMoves.filter((move) => {
            const [dx, dy] = move;
            // If we have no defined direction, allow any movement
            if (!direction)
                return true;
            // Check if it would be a reversal
            if ((direction === 'right' && dx < 0) ||
                (direction === 'left' && dx > 0) ||
                (direction === 'up' && dy > 0) ||
                (direction === 'down' && dy < 0)) {
                // If there is only one valid move and it would be a reversal, allow it anyway
                return validMoves.length === 1;
            }
            return true;
        });
        for (const [dx, dy] of filteredMoves) {
            const newX = x + dx;
            const newY = y + dy;
            const key = `${newX},${newY}`;
            if (visited.has(key))
                continue;
            visited.add(key);
            // Determine the new direction
            let newDirection;
            if (dx > 0)
                newDirection = 'right';
            else if (dx < 0)
                newDirection = 'left';
            else if (dy > 0)
                newDirection = 'down';
            else if (dy < 0)
                newDirection = 'up';
            else
                newDirection = direction;
            const pathNode = {
                x: newX,
                y: newY,
                pathDirection: newDirection
            };
            const newPath = [...path, pathNode];
            if (newX === targetX && newY === targetY) {
                // Return the first position of the path with the direction
                return newPath.length > 0
                    ? {
                        x: newPath[0].x,
                        y: newPath[0].y,
                        direction: newPath[0].pathDirection
                    }
                    : null;
            }
            queue.push({ x: newX, y: newY, path: newPath, direction: newDirection });
        }
    }
    // If we don't find a path, check if there is any valid movement
    const validMoves = _movement_utils__WEBPACK_IMPORTED_MODULE_1__.MovementUtils.getValidMoves(startX, startY);
    if (validMoves.length > 0) {
        // Choose a random move if we can't find a path
        const [dx, dy] = validMoves[Math.floor(Math.random() * validMoves.length)];
        let direction = currentDirection;
        if (dx > 0)
            direction = 'right';
        else if (dx < 0)
            direction = 'left';
        else if (dy > 0)
            direction = 'down';
        else if (dy < 0)
            direction = 'up';
        return {
            x: startX + dx,
            y: startY + dy,
            direction
        };
    }
    // If there is no valid movement, do not move
    return null;
};
// Calculates the fate for each ghost based on their personality
const calculateGhostTarget = (ghost, store) => {
    const { pacman } = store;
    let pacDirection = getPacmanDirection(store);
    // Adjust Blinky's speed based on remaining points (becomes more aggressive)
    let speedMultiplier = 1;
    if (ghost.name === 'blinky') {
        // When there are few points left, Blinky becomes faster ("Elroy mode")
        const totalDots = _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH * _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT;
        const dotsEaten = totalDots - dotsRemaining;
        const percentageEaten = dotsEaten / totalDots;
        if (percentageEaten > 0.7) {
            speedMultiplier = 1.2; // 20% faster
        }
        if (percentageEaten > 0.9) {
            speedMultiplier = 1.4; // 40% faster
        }
        // Apply speed multiplier if chasing Pac-Man
        if (Math.random() < 0.8 * speedMultiplier) {
            // Blinky aims directly at Pac-Man
            return { x: pacman.x, y: pacman.y };
        }
    }
    switch (ghost.name) {
        case 'blinky': // Red - Aim directly at Pac-Man
            return { x: pacman.x, y: pacman.y };
        case 'pinky': // Pink - tries to ambush Pac-Man by positioning herself in front of him
            const lookAhead = 4; // 4 cells ahead of Pac-Man
            // Special calculation for the original "bug": when Pac-Man looks up,
            // the calculation also adds 4 cells to the left
            let targetX = pacman.x;
            let targetY = pacman.y;
            if (pacman.direction === 'up') {
                // Reproducing the original bug
                targetX = pacman.x - 4;
                targetY = pacman.y - 4;
            }
            else {
                targetX = pacman.x + pacDirection[0] * lookAhead;
                targetY = pacman.y + pacDirection[1] * lookAhead;
            }
            // Ensure the target is within the grid
            targetX = Math.min(Math.max(targetX, 0), _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - 1);
            targetY = Math.min(Math.max(targetY, 0), _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - 1);
            return { x: targetX, y: targetY };
        case 'inky': // Blue - Coordinated behavior with Blinky
            const blinky = store.ghosts.find((g) => g.name === 'blinky');
            // Landmark: 2 cells ahead of Pac-Man
            let twoAhead = {
                x: pacman.x + pacDirection[0] * 2,
                y: pacman.y + pacDirection[1] * 2
            };
            // Again, reproducing the Pinky bug upwards
            if (pacman.direction === 'up') {
                twoAhead.x = pacman.x - 2;
                twoAhead.y = pacman.y - 2;
            }
            // If Blinky exists, calculate the vector from it
            if (blinky) {
                // Fold Blinky's vector to the reference point
                const vectorX = twoAhead.x - blinky.x;
                const vectorY = twoAhead.y - blinky.y;
                twoAhead = {
                    x: twoAhead.x + vectorX,
                    y: twoAhead.y + vectorY
                };
            }
            // Ensure the target is within the grid
            twoAhead.x = Math.min(Math.max(twoAhead.x, 0), _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - 1);
            twoAhead.y = Math.min(Math.max(twoAhead.y, 0), _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - 1);
            return twoAhead;
        case 'clyde': // Orange - Toggles between chasing and random
            const distanceToPacman = _movement_utils__WEBPACK_IMPORTED_MODULE_1__.MovementUtils.calculateDistance(ghost.x, ghost.y, pacman.x, pacman.y);
            // Clyde's special behavior: if he's too close, he runs away to his corner
            if (distanceToPacman < 8) {
                return SCATTER_CORNERS['clyde']; // Go to your corner when close
            }
            else {
                // When far away, chases Pac-Man directly
                return { x: pacman.x, y: pacman.y };
            }
        default:
            // Default behavior: Aim at Pac-Man
            return { x: pacman.x, y: pacman.y };
    }
};
const getPacmanDirection = (store) => {
    switch (store.pacman.direction) {
        case 'right':
            return [1, 0];
        case 'left':
            return [-1, 0];
        case 'up':
            return [0, -1];
        case 'down':
            return [0, 1];
        default:
            return [0, 0];
    }
};
// Get a random destination for spooked ghosts
const getRandomDestination = (x, y) => {
    const maxDistance = 8;
    const randomX = x + Math.floor(Math.random() * (2 * maxDistance + 1)) - maxDistance;
    const randomY = y + Math.floor(Math.random() * (2 * maxDistance + 1)) - maxDistance;
    return {
        x: Math.max(0, Math.min(randomX, _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - 1)),
        y: Math.max(0, Math.min(randomY, _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - 1))
    };
};
const GhostsMovement = {
    moveGhosts,
    resetGameMode
};


/***/ },

/***/ "./src/pacman/movement/movement-utils.ts"
/*!***********************************************!*\
  !*** ./src/pacman/movement/movement-utils.ts ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MovementUtils: () => (/* binding */ MovementUtils)
/* harmony export */ });
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/constants */ "./src/pacman/core/constants.ts");

const getValidMoves = (x, y) => {
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];
    return directions.filter(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX < 0 || newX >= _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH || newY < 0 || newY >= _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT) {
            return false;
        }
        if (dx === -1) {
            return !_core_constants__WEBPACK_IMPORTED_MODULE_0__.WALLS.vertical[x][y].active;
        }
        else if (dx === 1) {
            return !_core_constants__WEBPACK_IMPORTED_MODULE_0__.WALLS.vertical[x + 1][y].active;
        }
        else if (dy === -1) {
            return !_core_constants__WEBPACK_IMPORTED_MODULE_0__.WALLS.horizontal[x][y].active;
        }
        else if (dy === 1) {
            return !_core_constants__WEBPACK_IMPORTED_MODULE_0__.WALLS.horizontal[x][y + 1].active;
        }
        return true;
    });
};
const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};
const MovementUtils = {
    getValidMoves,
    calculateDistance,
    findNextStepDijkstra(start, target) {
        if (start.x === target.x && start.y === target.y)
            return null;
        const pq = [Object.assign(Object.assign({}, start), { cost: 0, path: [] })];
        const visited = new Set([`${start.x},${start.y}`]);
        while (pq.length) {
            pq.sort((a, b) => a.cost - b.cost);
            const { x, y, cost, path } = pq.shift();
            for (const [dx, dy] of getValidMoves(x, y)) {
                const nx = x + dx, ny = y + dy, key = `${nx},${ny}`;
                if (visited.has(key))
                    continue;
                visited.add(key);
                const newPath = [...path, { x: nx, y: ny }];
                if (nx === target.x && ny === target.y) {
                    return newPath.length > 0 ? newPath[0] : null;
                }
                pq.push({ x: nx, y: ny, cost: cost + 1, path: newPath });
            }
        }
        return null;
    }
};


/***/ },

/***/ "./src/pacman/movement/pacman-movement.ts"
/*!************************************************!*\
  !*** ./src/pacman/movement/pacman-movement.ts ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PacmanMovement: () => (/* binding */ PacmanMovement)
/* harmony export */ });
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/constants */ "./src/pacman/core/constants.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types */ "./src/pacman/types.ts");
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _movement_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./movement-utils */ "./src/pacman/movement/movement-utils.ts");




const RECENT_POSITIONS_LIMIT = 5;
const movePacman = (store) => {
    if (store.pacman.deadRemainingDuration)
        return;
    const hasPowerup = !!store.pacman.powerupRemainingDuration;
    const scaredGhosts = store.ghosts.filter((ghost) => ghost.scared);
    let targetPosition;
    // Find a target position, ensuring it's never undefined
    try {
        if (hasPowerup && scaredGhosts.length > 0) {
            const ghostPosition = findClosestScaredGhost(store);
            targetPosition = ghostPosition !== null && ghostPosition !== void 0 ? ghostPosition : findOptimalTarget(store);
        }
        else if (store.pacman.target) {
            if (store.pacman.x === store.pacman.target.x && store.pacman.y === store.pacman.target.y) {
                targetPosition = findOptimalTarget(store);
                store.pacman.target = targetPosition;
            }
            else {
                targetPosition = store.pacman.target;
            }
        }
        else {
            targetPosition = findOptimalTarget(store);
            store.pacman.target = targetPosition;
        }
        // Safety check to ensure targetPosition is never undefined
        if (!targetPosition) {
            targetPosition = { x: store.pacman.x, y: store.pacman.y };
        }
        const nextPosition = calculateOptimalPath(store, targetPosition);
        nextPosition ? updatePacmanPosition(store, nextPosition) : makeDesperationMove(store);
        checkAndEatPoint(store);
    }
    catch (error) {
        console.error('Error in movePacman:', error);
        // If all else fails, don't move
    }
};
const findClosestScaredGhost = (store) => {
    const scaredGhosts = store.ghosts.filter((g) => g.scared);
    if (scaredGhosts.length === 0)
        return null;
    return scaredGhosts.reduce((closest, ghost) => {
        const distance = _movement_utils__WEBPACK_IMPORTED_MODULE_3__.MovementUtils.calculateDistance(ghost.x, ghost.y, store.pacman.x, store.pacman.y);
        return distance < closest.distance ? { x: ghost.x, y: ghost.y, distance } : closest;
    }, { x: store.pacman.x, y: store.pacman.y, distance: Infinity });
};
const findOptimalTarget = (store) => {
    const pointCells = [];
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH; x++) {
        for (let y = 0; y < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT; y++) {
            const cell = store.grid[x][y];
            if (cell.level !== 'NONE') {
                const distance = _movement_utils__WEBPACK_IMPORTED_MODULE_3__.MovementUtils.calculateDistance(x, y, store.pacman.x, store.pacman.y);
                const value = cell.commitsCount / (distance + 1);
                pointCells.push({ x, y, value });
            }
        }
    }
    pointCells.sort((a, b) => b.value - a.value);
    // Check if there are any cells with points left
    if (pointCells.length === 0) {
        // Return Pac-Man's current position as fallback
        return { x: store.pacman.x, y: store.pacman.y, value: 0 };
    }
    return pointCells[0];
};
const REVISIT_PENALTY = 100;
const GHOST_ADJACENT_DANGER = 14;
const GHOST_ADJACENT_PENALTY = 1000000;
const resolveSafetyWeight = (store) => {
    let safetyWeight = 0.5;
    switch (store.config.playerStyle) {
        case _types__WEBPACK_IMPORTED_MODULE_1__.PlayerStyle.CONSERVATIVE:
            safetyWeight = 3.0;
            break;
        case _types__WEBPACK_IMPORTED_MODULE_1__.PlayerStyle.AGGRESSIVE:
            safetyWeight = 0.3;
            break;
        case _types__WEBPACK_IMPORTED_MODULE_1__.PlayerStyle.OPPORTUNISTIC:
        default:
            safetyWeight = 0.8;
            break;
    }
    let closestGhostDistance = Infinity;
    store.ghosts.forEach((ghost) => {
        if (!ghost.scared) {
            const dist = _movement_utils__WEBPACK_IMPORTED_MODULE_3__.MovementUtils.calculateDistance(store.pacman.x, store.pacman.y, ghost.x, ghost.y);
            closestGhostDistance = Math.min(closestGhostDistance, dist);
        }
    });
    const proximityThreshold = store.config.playerStyle === _types__WEBPACK_IMPORTED_MODULE_1__.PlayerStyle.CONSERVATIVE ? 5 : 7;
    const dangerNearby = closestGhostDistance < proximityThreshold;
    if (store.config.playerStyle === _types__WEBPACK_IMPORTED_MODULE_1__.PlayerStyle.CONSERVATIVE && dangerNearby) {
        safetyWeight *= 5;
    }
    return safetyWeight;
};
const stepCost = (store, dangerMap, safetyWeight, x, y) => {
    var _a, _b;
    const key = `${x},${y}`;
    const danger = (_a = dangerMap.get(key)) !== null && _a !== void 0 ? _a : 0;
    const revisit = ((_b = store.pacman.recentPositions) === null || _b === void 0 ? void 0 : _b.includes(key)) ? REVISIT_PENALTY : 0;
    const ghostAdjacentPenalty = danger >= GHOST_ADJACENT_DANGER ? GHOST_ADJACENT_PENALTY : 0;
    return 1 + danger * safetyWeight + revisit + ghostAdjacentPenalty;
};
const heuristic = (from, target) => {
    return Math.abs(from.x - target.x) + Math.abs(from.y - target.y);
};
const reconstructFirstStep = (cameFrom, targetKey, startKey) => {
    let cursor = targetKey;
    let parent = cameFrom.get(cursor);
    while (parent !== undefined && parent !== startKey) {
        cursor = parent;
        parent = cameFrom.get(cursor);
    }
    if (parent === undefined)
        return null;
    const [x, y] = cursor.split(',').map(Number);
    return { x, y };
};
const calculateOptimalPath = (store, target) => {
    var _a, _b;
    const start = { x: store.pacman.x, y: store.pacman.y };
    if (start.x === target.x && start.y === target.y)
        return null;
    const dangerMap = createDangerMap(store);
    const safetyWeight = resolveSafetyWeight(store);
    const startKey = `${start.x},${start.y}`;
    const targetKey = `${target.x},${target.y}`;
    const open = [{ x: start.x, y: start.y, g: 0, f: heuristic(start, target) }];
    const gScore = new Map([[startKey, 0]]);
    const cameFrom = new Map();
    while (open.length > 0) {
        let bestIdx = 0;
        for (let i = 1; i < open.length; i++) {
            if (open[i].f < open[bestIdx].f)
                bestIdx = i;
        }
        const current = open.splice(bestIdx, 1)[0];
        const currentKey = `${current.x},${current.y}`;
        if (current.g > ((_a = gScore.get(currentKey)) !== null && _a !== void 0 ? _a : Infinity))
            continue;
        if (currentKey === targetKey) {
            return reconstructFirstStep(cameFrom, targetKey, startKey);
        }
        for (const [dx, dy] of _movement_utils__WEBPACK_IMPORTED_MODULE_3__.MovementUtils.getValidMoves(current.x, current.y)) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const neighborKey = `${nx},${ny}`;
            const tentativeG = current.g + stepCost(store, dangerMap, safetyWeight, nx, ny);
            if (tentativeG < ((_b = gScore.get(neighborKey)) !== null && _b !== void 0 ? _b : Infinity)) {
                gScore.set(neighborKey, tentativeG);
                cameFrom.set(neighborKey, currentKey);
                open.push({
                    x: nx,
                    y: ny,
                    g: tentativeG,
                    f: tentativeG + heuristic({ x: nx, y: ny }, target)
                });
            }
        }
    }
    return null;
};
const createDangerMap = (store) => {
    const map = new Map();
    const hasPowerup = !!store.pacman.powerupRemainingDuration;
    store.ghosts.forEach((ghost) => {
        if (ghost.scared)
            return;
        for (let dx = -5; dx <= 5; dx++) {
            for (let dy = -5; dy <= 5; dy++) {
                const x = ghost.x + dx;
                const y = ghost.y + dy;
                if (x >= 0 && x < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH && y >= 0 && y < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT) {
                    const key = `${x},${y}`;
                    const distance = Math.abs(dx) + Math.abs(dy);
                    const value = 15 - distance;
                    if (value > 0) {
                        const current = map.get(key) || 0;
                        map.set(key, Math.max(current, value));
                    }
                }
            }
        }
    });
    if (hasPowerup) {
        for (const [key, value] of map.entries()) {
            map.set(key, value / 5);
        }
    }
    return map;
};
const makeDesperationMove = (store) => {
    const validMoves = _movement_utils__WEBPACK_IMPORTED_MODULE_3__.MovementUtils.getValidMoves(store.pacman.x, store.pacman.y);
    if (validMoves.length === 0)
        return;
    const safest = validMoves.reduce((best, [dx, dy]) => {
        const newX = store.pacman.x + dx;
        const newY = store.pacman.y + dy;
        let minDist = Infinity;
        store.ghosts.forEach((ghost) => {
            if (!ghost.scared) {
                const dist = _movement_utils__WEBPACK_IMPORTED_MODULE_3__.MovementUtils.calculateDistance(ghost.x, ghost.y, newX, newY);
                minDist = Math.min(minDist, dist);
            }
        });
        return minDist > best.distance ? { dx, dy, distance: minDist } : best;
    }, { dx: 0, dy: 0, distance: -Infinity });
    updatePacmanPosition(store, {
        x: store.pacman.x + safest.dx,
        y: store.pacman.y + safest.dy
    });
};
const updatePacmanPosition = (store, position) => {
    var _a;
    (_a = store.pacman).recentPositions || (_a.recentPositions = []);
    store.pacman.recentPositions.push(`${position.x},${position.y}`);
    if (store.pacman.recentPositions.length > RECENT_POSITIONS_LIMIT) {
        store.pacman.recentPositions.shift();
    }
    const dx = position.x - store.pacman.x;
    const dy = position.y - store.pacman.y;
    store.pacman.direction = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : dy < 0 ? 'up' : store.pacman.direction;
    store.pacman.x = position.x;
    store.pacman.y = position.y;
};
const checkAndEatPoint = (store) => {
    const cell = store.grid[store.pacman.x][store.pacman.y];
    if (cell.level !== 'NONE') {
        store.pacman.totalPoints += cell.commitsCount;
        store.pacman.points++;
        store.config.pointsIncreasedCallback(store.pacman.totalPoints);
        const theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_2__.Utils.getCurrentTheme(store);
        // Power-up activated in the cell
        if (cell.level === 'FOURTH_QUARTILE') {
            activatePowerUp(store);
        }
        // "Delete" point from cell
        cell.level = 'NONE';
        cell.color = theme.intensityColors[0];
        cell.commitsCount = 0;
    }
};
const activatePowerUp = (store) => {
    store.pacman.powerupRemainingDuration = _core_constants__WEBPACK_IMPORTED_MODULE_0__.PACMAN_POWERUP_DURATION;
    store.ghosts.forEach((g) => {
        if (g.name !== 'eyes')
            g.scared = true;
    });
};
const PacmanMovement = {
    movePacman
};


/***/ },

/***/ "./src/pacman/renderers/renderer-units.ts"
/*!************************************************!*\
  !*** ./src/pacman/renderers/renderer-units.ts ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RendererUnits: () => (/* binding */ RendererUnits)
/* harmony export */ });
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/constants */ "./src/pacman/core/constants.ts");

const generatePacManColors = (pacman) => {
    if (pacman.deadRemainingDuration) {
        return _core_constants__WEBPACK_IMPORTED_MODULE_0__.PACMAN_COLOR_DEAD;
    }
    else if (pacman.powerupRemainingDuration) {
        return _core_constants__WEBPACK_IMPORTED_MODULE_0__.PACMAN_COLOR_POWERUP;
    }
    else {
        return _core_constants__WEBPACK_IMPORTED_MODULE_0__.PACMAN_COLOR;
    }
};
const RendererUnits = {
    generatePacManColors
};


/***/ },

/***/ "./src/pacman/renderers/svg.ts"
/*!*************************************!*\
  !*** ./src/pacman/renderers/svg.ts ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SVG: () => (/* binding */ SVG)
/* harmony export */ });
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/constants */ "./src/pacman/core/constants.ts");
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _renderer_units__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderer-units */ "./src/pacman/renderers/renderer-units.ts");
/* harmony import */ var _core_f1_graphics__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/f1-graphics */ "./src/pacman/core/f1-graphics.ts");




const SVG_KEY_TIMES_PRECISION = 4;
const generateAnimatedSVG = (store) => {
    // Dimensions and duration
    const svgWidth = _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE);
    const svgHeight = _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE) + 30; // Extra height for time counter
    const totalDurationMs = store.gameHistory.length * _core_constants__WEBPACK_IMPORTED_MODULE_0__.DELTA_TIME;
    // Basic SVG structure
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<desc>Generated with pacman-contribution-graph on ${new Date()}</desc>`;
    svg += `<metadata>
		<info>
			<frames>${store.gameHistory.length}</frames>
			<frameRate>${1000 / _core_constants__WEBPACK_IMPORTED_MODULE_0__.DELTA_TIME}</frameRate>
			<durationMs>${totalDurationMs}</durationMs>
			<generatedOn>${new Date().toISOString()}</generatedOn>
		</info>
	</metadata>`;
    svg += `<rect width="100%" height="100%" fill="${_shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.getCurrentTheme(store).gridBackground}"/>`;
    svg += _core_f1_graphics__WEBPACK_IMPORTED_MODULE_3__.CHECKERED_FLAG_PATTERN;
    svg += generateGhostsPredefinition();
    // Month labels
    let lastMonth = '';
    for (let y = 0; y < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH; y++) {
        if (store.monthLabels[y] !== lastMonth) {
            const xPos = y * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE) + _core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE / 2;
            svg += `<text x="${xPos}" y="10" text-anchor="middle" font-size="10" fill="${_shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.getCurrentTheme(store).textColor}">${store.monthLabels[y]}</text>`;
            lastMonth = store.monthLabels[y];
        }
    }
    // Grid
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH; x++) {
        for (let y = 0; y < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT; y++) {
            const cellX = x * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE);
            const cellY = y * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE) + 15;
            const cellColorAnimation = generateChangingValuesAnimation(store, generateCellColorValues(store, x, y));
            svg += `<rect id="c-${x}-${y}" x="${cellX}" y="${cellY}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}" rx="2" fill="${_shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.getCurrentTheme(store).intensityColors[0]}">
				<animate attributeName="fill" dur="${totalDurationMs}ms" repeatCount="indefinite" calcMode="discrete"
					values="${cellColorAnimation.values}" 
					keyTimes="${cellColorAnimation.keyTimes}"/>
			</rect>`;
        }
    }
    // Horizontal walls
    for (let y = 0; y < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT; y++) {
        let runStart = null;
        for (let x = 0; x <= _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH; x++) {
            let active = x < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH && _core_constants__WEBPACK_IMPORTED_MODULE_0__.WALLS.horizontal[x][y].active;
            if (active && runStart === null) {
                runStart = x;
            }
            if ((!active || x === _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH) && runStart !== null) {
                let length = x - runStart;
                svg += `<rect id="wh-${runStart}-${y}" x="${runStart * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE) - _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE}" y="${y * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE) - _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE + 15}" width="${length * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE)}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE}" fill="${_shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.getCurrentTheme(store).wallColor}"></rect>`;
                runStart = null;
            }
        }
    }
    // Vertical walls
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH; x++) {
        let runStart = null;
        for (let y = 0; y <= _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT; y++) {
            let active = y < _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT && _core_constants__WEBPACK_IMPORTED_MODULE_0__.WALLS.vertical[x][y].active;
            if (active && runStart === null) {
                runStart = y;
            }
            if ((!active || y === _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT) && runStart !== null) {
                let length = y - runStart;
                svg += `<rect id="wv-${x}-${runStart}" x="${x * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE) - _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE}" y="${runStart * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE) - _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE + 15}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE}" height="${length * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE)}" fill="${_shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.getCurrentTheme(store).wallColor}"></rect>`;
                runStart = null;
            }
        }
    }
    // F1 Car
    const pacmanColorAnimation = generateChangingValuesAnimation(store, store.gameHistory.map((el) => _renderer_units__WEBPACK_IMPORTED_MODULE_2__.RendererUnits.generatePacManColors(el.pacman)));
    const pacmanPositionAnimation = generateChangingValuesAnimation(store, generatePacManPositions(store));
    // Map F1 car direction changes for visibility animation
    const f1CarDirectionChanges = mapF1CarDirectionChanges(store);
    svg += `<g id="f1-car-group" transform="translate(0,0)">
		<animateTransform attributeName="transform" type="translate" dur="${totalDurationMs}ms" repeatCount="indefinite"
			keyTimes="${pacmanPositionAnimation.keyTimes}"
			values="${pacmanPositionAnimation.values}"
			additive="replace"/>`;
    // For each direction, create a <use> element with visibility animation
    ['up', 'down', 'left', 'right'].forEach((direction) => {
        const directionChanges = f1CarDirectionChanges[direction];
        if (directionChanges && directionChanges.length > 0) {
            const keyTimes = directionChanges.map((kf) => kf.time.toFixed(SVG_KEY_TIMES_PRECISION)).join(';');
            const values = directionChanges.map((kf) => (kf.visible ? 'visible' : 'hidden')).join(';');
            const initialVisibility = directionChanges[0].visible ? 'visible' : 'hidden';
            const scale = 1.8;
            const offset = (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE - (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE * scale)) / 2;
            svg += `<use href="#f1-car-${direction}" x="${offset}" y="${offset}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE * scale}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE * scale}" visibility="${initialVisibility}">
				<animate attributeName="visibility" 
					dur="${totalDurationMs}ms" repeatCount="indefinite"
					keyTimes="${keyTimes}"
					values="${values}" />
			</use>`;
        }
    });
    svg += `</g>`;
    // Process each ghost separately
    store.ghosts.forEach((ghost, index) => {
        // Generate position animation for this ghost
        const ghostPositionAnimation = generateChangingValuesAnimation(store, generateGhostPositions(store, index));
        // Create a group for the ghost
        svg += `<g id="ghost${index}" transform="translate(0,0)">
			<animateTransform attributeName="transform" type="translate" 
				dur="${totalDurationMs}ms" repeatCount="indefinite"
				keyTimes="${ghostPositionAnimation.keyTimes}"
				values="${ghostPositionAnimation.values}"
				additive="replace"/>`;
        // Map all possible state + direction combinations for this ghost
        const stateChanges = mapGhostStateChanges(store, index);
        // For each possible state, create a <use> element with visibility animation
        for (const [state, keyframes] of Object.entries(stateChanges)) {
            // Ignore empty states
            if (keyframes.length === 0)
                continue;
            // Use the correct ID for reference (blinky-right, scared, etc)
            const href = `#ghost-${state}`;
            // Build the strings for the animation
            const keyTimes = keyframes.map((kf) => kf.time.toFixed(SVG_KEY_TIMES_PRECISION)).join(';');
            const values = keyframes.map((kf) => (kf.visible ? 'visible' : 'hidden')).join(';');
            // Initial visibility
            const initialVisibility = keyframes[0].visible ? 'visible' : 'hidden';
            svg += `<use href="${href}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}" visibility="${initialVisibility}">
				<animate attributeName="visibility" 
					dur="${totalDurationMs}ms" repeatCount="indefinite"
					keyTimes="${keyTimes}"
					values="${values}" />
			</use>`;
        }
        // Close the ghost group
        svg += `</g>`;
    });
    svg += '</svg>';
    return svg;
};
// Helper function to map all ghost state changes
function mapGhostStateChanges(store, ghostIndex) {
    // A map of states for frames where they are visible
    // Key: "name-direction" or "scared" or "eyes-direction"
    // Value: array of {time: number, visible: boolean}
    const stateChanges = {};
    // Initialize possible states for all ghosts
    const allPossibleStates = [
        'blinky-up',
        'blinky-down',
        'blinky-left',
        'blinky-right',
        'inky-up',
        'inky-down',
        'inky-left',
        'inky-right',
        'pinky-up',
        'pinky-down',
        'pinky-left',
        'pinky-right',
        'clyde-up',
        'clyde-down',
        'clyde-left',
        'clyde-right',
        'eyes-up',
        'eyes-down',
        'eyes-left',
        'eyes-right',
        'scared'
    ];
    // Initialize all states as hidden
    allPossibleStates.forEach((state) => {
        stateChanges[state] = [{ time: 0, visible: false }];
    });
    // Get the initial ghost
    const initialGhost = store.ghosts[ghostIndex];
    if (!initialGhost)
        return stateChanges;
    // Set the initial state correctly
    const initialState = initialGhost.scared
        ? 'scared'
        : initialGhost.name === 'eyes'
            ? `eyes-${initialGhost.direction || 'right'}`
            : `${initialGhost.name}-${initialGhost.direction || 'right'}`;
    // Mark this state as visible initially
    stateChanges[initialState] = [{ time: 0, visible: true }];
    // Track last state
    let lastState = initialState;
    // Process each frame of the game history
    store.gameHistory.forEach((state, frameIndex) => {
        // If the ghost does not exist in this frame, skip
        if (ghostIndex >= state.ghosts.length)
            return;
        const ghost = state.ghosts[ghostIndex];
        const currentTime = frameIndex / (store.gameHistory.length - 1);
        // Determine the current state
        const currentState = ghost.scared
            ? 'scared'
            : ghost.name === 'eyes'
                ? `eyes-${ghost.direction || 'right'}`
                : `${ghost.name}-${ghost.direction || 'right'}`;
        // If the status has changed
        if (currentState !== lastState) {
            // Hide previous state
            stateChanges[lastState].push({ time: currentTime, visible: false });
            // Show new status
            if (!stateChanges[currentState]) {
                stateChanges[currentState] = [{ time: 0, visible: false }];
            }
            stateChanges[currentState].push({ time: currentTime, visible: true });
            // Update the latest status
            lastState = currentState;
        }
    });
    // Ensure the last state remains visible until the end
    stateChanges[lastState].push({ time: 1, visible: true });
    // Ensure all other states are hidden until the end
    Object.keys(stateChanges).forEach((state) => {
        if (state !== lastState && stateChanges[state].length > 0) {
            const lastKeyframe = stateChanges[state][stateChanges[state].length - 1];
            if (lastKeyframe.time < 1) {
                stateChanges[state].push({ time: 1, visible: false });
            }
        }
    });
    return stateChanges;
}
const mapF1CarDirectionChanges = (store) => {
    var _a;
    // A map of directions with their visibility keyframes
    // Key: "up" | "down" | "left" | "right"
    // Value: array of {time: number, visible: boolean}
    const directionChanges = {};
    // Initialize all directions as hidden
    ['up', 'down', 'left', 'right'].forEach((direction) => {
        directionChanges[direction] = [{ time: 0, visible: false }];
    });
    // Set the initial direction
    const initialDirection = ((_a = store.gameHistory[0]) === null || _a === void 0 ? void 0 : _a.pacman.direction) || 'right';
    directionChanges[initialDirection] = [{ time: 0, visible: true }];
    let lastDirection = initialDirection;
    // Process each frame of the game history
    store.gameHistory.forEach((state, frameIndex) => {
        const currentDirection = state.pacman.direction;
        const currentTime = frameIndex / (store.gameHistory.length - 1);
        // If the direction has changed
        if (currentDirection !== lastDirection) {
            // Hide previous direction
            directionChanges[lastDirection].push({ time: currentTime, visible: false });
            // Show new direction
            if (!directionChanges[currentDirection]) {
                directionChanges[currentDirection] = [{ time: 0, visible: false }];
            }
            directionChanges[currentDirection].push({ time: currentTime, visible: true });
            // Update the latest direction
            lastDirection = currentDirection;
        }
    });
    // Ensure the last direction remains visible until the end
    directionChanges[lastDirection].push({ time: 1, visible: true });
    // Ensure all other directions are hidden until the end
    Object.keys(directionChanges).forEach((direction) => {
        if (direction !== lastDirection && directionChanges[direction].length > 0) {
            const lastKeyframe = directionChanges[direction][directionChanges[direction].length - 1];
            if (lastKeyframe.time < 1) {
                directionChanges[direction].push({ time: 1, visible: false });
            }
        }
    });
    return directionChanges;
};
const generatePacManPositions = (store) => {
    return store.gameHistory.map((state) => {
        const x = state.pacman.x * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE);
        const y = state.pacman.y * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE) + 15;
        return `${x},${y}`;
    });
};
const generateCellColorValues = (store, x, y) => {
    const theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.getCurrentTheme(store);
    return store.gameHistory.map((state) => {
        const color = state.grid[x][y].color;
        return color === theme.intensityColors[0] ? color : 'url(#checkered-flag)';
    });
};
const generateGhostPositions = (store, ghostIndex) => {
    return store.gameHistory.map((state) => {
        var _a, _b;
        if (ghostIndex >= state.ghosts.length) {
            return '0,0'; // Default value for cases where the ghost does not exist
        }
        const ghost = state.ghosts[ghostIndex];
        const fx = ghost.x + ((_a = ghost.subX) !== null && _a !== void 0 ? _a : 0);
        const fy = ghost.y + ((_b = ghost.subY) !== null && _b !== void 0 ? _b : 0);
        const x = fx * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE);
        const y = fy * (_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE) + 15;
        return `${x},${y}`;
    });
};
const generateGhostsPredefinition = () => {
    let defs = `<defs>`;
    // For F1 car - add symbols for each direction
    ['up', 'down', 'left', 'right'].forEach((direction) => {
        const carImage = _core_f1_graphics__WEBPACK_IMPORTED_MODULE_3__.F1_CAR_IMAGES[direction];
        let rot = 0;
        if (direction === 'right')
            rot = 90;
        if (direction === 'down')
            rot = 180;
        if (direction === 'left')
            rot = 270;
        defs += `
                <symbol id="f1-car-${direction}" viewBox="0 0 ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE} ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}">
                    <image href="${carImage}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}" transform="rotate(${rot} ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE / 2} ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE / 2})"/>
                </symbol>
                `;
    });
    // For every regular ghost
    ['blinky', 'inky', 'pinky', 'clyde'].forEach((ghostName) => {
        // For each direction
        ['up', 'down', 'left', 'right'].forEach((direction) => {
            const ghostObj = _core_constants__WEBPACK_IMPORTED_MODULE_0__.GHOSTS[ghostName];
            if (direction in ghostObj) {
                defs += `
                <symbol id="ghost-${ghostName}-${direction}" viewBox="0 0 ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE} ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}">
                    <image href="${ghostObj[direction]}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}"/>
                </symbol>
                `;
            }
        });
    });
    // Add the scared ghost
    defs += `
    <symbol id="ghost-scared" viewBox="0 0 ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE} ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}">
        <image href="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.GHOSTS['scared'].imgDate}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}"/>
    </symbol>`;
    // Add ghost eyes (for each direction)
    ['up', 'down', 'left', 'right'].forEach((direction) => {
        if (_core_constants__WEBPACK_IMPORTED_MODULE_0__.GHOSTS['eyes'] && direction in _core_constants__WEBPACK_IMPORTED_MODULE_0__.GHOSTS['eyes']) {
            const eyesObj = _core_constants__WEBPACK_IMPORTED_MODULE_0__.GHOSTS['eyes'];
            defs += `
            <symbol id="ghost-eyes-${direction}" viewBox="0 0 ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE} ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}">
                <image href="${eyesObj[direction]}" width="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}" height="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}"/>
            </symbol>
            `;
        }
        else {
            // Fallback if direction is not set
            console.warn(`Imagem para eyes-${direction} não encontrada, usando placeholder`);
            defs += `
            <symbol id="ghost-eyes-${direction}" viewBox="0 0 ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE} ${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE}">
                <circle cx="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE / 2}" cy="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE / 2}" r="${_core_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE / 3}" fill="white"/>
            </symbol>
            `;
        }
    });
    defs += `</defs>`;
    return defs;
};
const generateChangingValuesAnimation = (store, changingValues) => {
    if (store.gameHistory.length !== changingValues.length) {
        throw new Error(`The amount of values (${changingValues.length}) does not match the size of the game history (${store.gameHistory.length})`);
    }
    const totalFrames = store.gameHistory.length;
    if (totalFrames === 0) {
        return { keyTimes: '0;1', values: changingValues[0] || '#000;#000' };
    }
    let keyTimes = [];
    let values = [];
    let lastValue = null;
    let lastIndex = null;
    changingValues.forEach((currentValue, index) => {
        if (currentValue !== lastValue) {
            if (lastValue !== null && lastIndex !== null && index - 1 !== lastIndex) {
                // Add a keyframe right before the value change
                keyTimes.push(Number(((index - 1 / (10 * SVG_KEY_TIMES_PRECISION)) / (totalFrames - 1)).toFixed(SVG_KEY_TIMES_PRECISION)));
                values.push(lastValue);
            }
            // Add the new value keyframe
            keyTimes.push(Number((index / (totalFrames - 1)).toFixed(SVG_KEY_TIMES_PRECISION)));
            values.push(currentValue);
            lastValue = currentValue;
            lastIndex = index;
        }
    });
    // Ensure the last frame is always included
    if (keyTimes.length === 0 || keyTimes[keyTimes.length - 1] !== 1) {
        // If there are no keyframes, add start and end frames
        if (keyTimes.length === 0) {
            keyTimes.push(0, 1);
            values.push(changingValues[0] || '#000', changingValues[changingValues.length - 1] || '#000');
        }
        else {
            keyTimes.push(1);
            values.push(lastValue || changingValues[changingValues.length - 1] || '#000');
        }
    }
    return {
        keyTimes: keyTimes.join(';'),
        values: values.join(';')
    };
};
const SVG = {
    generateAnimatedSVG
};


/***/ },

/***/ "./src/pacman/types.ts"
/*!*****************************!*\
  !*** ./src/pacman/types.ts ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlayerStyle: () => (/* binding */ PlayerStyle)
/* harmony export */ });
var PlayerStyle;
(function (PlayerStyle) {
    PlayerStyle["CONSERVATIVE"] = "conservative";
    PlayerStyle["AGGRESSIVE"] = "aggressive";
    PlayerStyle["OPPORTUNISTIC"] = "opportunistic";
})(PlayerStyle || (PlayerStyle = {}));


/***/ },

/***/ "./src/pacman/utils/grid.ts"
/*!**********************************!*\
  !*** ./src/pacman/utils/grid.ts ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Grid: () => (/* binding */ Grid)
/* harmony export */ });
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/constants */ "./src/pacman/core/constants.ts");

const setSymmetricWall = (x, y, direction, sym, lineId) => {
    if (direction == 'horizontal') {
        (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(x, y, 'horizontal', lineId);
        if (sym == 'x') {
            (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(_core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - x - 1, y, 'horizontal', lineId);
        }
        else if (sym == 'y') {
            (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(x, _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - y, 'horizontal', lineId);
        }
        else if (sym == 'xy') {
            (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(_core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - x - 1, y, 'horizontal', lineId);
            (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(x, _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - y, 'horizontal', lineId);
            (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(_core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - x - 1, _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - y, 'horizontal', lineId);
        }
    }
    else {
        (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(x, y, 'vertical', lineId);
        if (sym == 'x') {
            (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(_core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - x, y, 'vertical', lineId);
        }
        else if (sym == 'y') {
            (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(x, _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - y - 1, 'vertical', lineId);
        }
        else if (sym == 'xy') {
            (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(_core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - x, y, 'vertical', lineId);
            (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(x, _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - y - 1, 'vertical', lineId);
            (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(_core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH - x, _core_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT - y - 1, 'vertical', lineId);
        }
    }
};
const buildWalls = () => {
    setSymmetricWall(0, 2, 'horizontal', 'xy', 'L1');
    setSymmetricWall(1, 2, 'horizontal', 'xy', 'L1');
    //setSymmetricWall(4, 0, 'vertical', 'x', 'L2');
    setSymmetricWall(4, 1, 'vertical', 'x', 'L2');
    setSymmetricWall(4, 2, 'vertical', 'x', 'L2');
    setSymmetricWall(4, 3, 'vertical', 'x', 'L2');
    setSymmetricWall(4, 4, 'vertical', 'x', 'L2');
    setSymmetricWall(3, 3, 'horizontal', 'x', 'L3');
    setSymmetricWall(2, 3, 'horizontal', 'x', 'L3');
    setSymmetricWall(4, 5, 'horizontal', 'x', 'L4');
    setSymmetricWall(6, 4, 'vertical', 'x', 'L5');
    setSymmetricWall(6, 3, 'vertical', 'x', 'L5');
    setSymmetricWall(6, 2, 'vertical', 'x', 'L5');
    setSymmetricWall(6, 2, 'horizontal', 'x', 'L6');
    setSymmetricWall(7, 2, 'horizontal', 'x', 'L6');
    setSymmetricWall(8, 2, 'horizontal', 'x', 'L6');
    setSymmetricWall(9, 2, 'horizontal', 'x', 'L6');
    setSymmetricWall(13, 2, 'horizontal', 'xy', 'L7');
    setSymmetricWall(14, 2, 'horizontal', 'xy', 'L7');
    setSymmetricWall(15, 2, 'horizontal', 'xy', 'L7');
    setSymmetricWall(16, 2, 'horizontal', 'xy', 'L7');
    setSymmetricWall(17, 2, 'horizontal', 'xy', 'L7');
    setSymmetricWall(18, 2, 'horizontal', 'xy', 'L7');
    setSymmetricWall(16, 2, 'vertical', 'xy', 'L8');
    setSymmetricWall(8, 1, 'horizontal', 'x', 'L9');
    setSymmetricWall(9, 1, 'horizontal', 'x', 'L9');
    setSymmetricWall(10, 1, 'horizontal', 'x', 'L9');
    setSymmetricWall(11, 1, 'horizontal', 'x', 'L9');
    setSymmetricWall(12, 1, 'vertical', 'x', 'L10');
    setSymmetricWall(12, 3, 'vertical', 'x', 'L10');
    setSymmetricWall(11, 4, 'horizontal', 'x', 'L11');
    setSymmetricWall(10, 4, 'horizontal', 'x', 'L11');
    setSymmetricWall(9, 4, 'horizontal', 'x', 'L11');
    setSymmetricWall(8, 4, 'horizontal', 'x', 'L11');
    setSymmetricWall(8, 4, 'vertical', 'x', 'L12');
    setSymmetricWall(8, 5, 'vertical', 'x', 'L12');
    //setSymmetricWall(8, 6, 'vertical', 'x', 'L12');
    // setSymmetricWall(23, 2, 'horizontal', 'x', 'L13');
    // setSymmetricWall(24, 2, 'horizontal', 'x', 'L13');
    // setSymmetricWall(23, 4, 'horizontal', 'x', 'L13');
    // setSymmetricWall(24, 4, 'horizontal', 'x', 'L13');
    // setSymmetricWall(25, 4, 'horizontal', 'x', 'L13');
    // setSymmetricWall(23, 2, 'vertical', 'x', 'L14');
    // setSymmetricWall(23, 3, 'vertical', 'x', 'L14');
    // setSymmetricWall(26, 4, 'vertical', 'x', 'L15');
    // setSymmetricWall(26, 5, 'vertical', 'x', 'L15');
    // setSymmetricWall(23, 6, 'horizontal', 'x', 'L16');
    // setSymmetricWall(24, 6, 'horizontal', 'x', 'L16');
    // setSymmetricWall(25, 6, 'horizontal', 'x', 'L16');
    // setSymmetricWall(26, 0, 'vertical', 'x', 'L17');
    // setSymmetricWall(24, 1, 'vertical', 'x', 'L18');
    setSymmetricWall(23, 1, 'horizontal', 'x', 'L18');
    setSymmetricWall(22, 1, 'horizontal', 'x', 'L18');
    setSymmetricWall(21, 1, 'horizontal', 'x', 'L18');
    setSymmetricWall(21, 1, 'vertical', 'x', 'L18');
    setSymmetricWall(21, 2, 'vertical', 'x', 'L18');
    setSymmetricWall(21, 3, 'vertical', 'x', 'L18');
    setSymmetricWall(20, 4, 'horizontal', 'x', 'L18');
    setSymmetricWall(19, 4, 'horizontal', 'x', 'L18');
    setSymmetricWall(19, 3, 'vertical', 'x', 'L18');
    setSymmetricWall(18, 3, 'horizontal', 'x', 'L18');
    setSymmetricWall(22, 5, 'vertical', 'x', 'L19');
    setSymmetricWall(21, 5, 'horizontal', 'x', 'L19');
    setSymmetricWall(20, 5, 'horizontal', 'x', 'L19');
    setSymmetricWall(20, 5, 'vertical', 'x', 'L19');
    setSymmetricWall(1, 6, 'horizontal', 'x', 'L20');
    setSymmetricWall(2, 6, 'horizontal', 'x', 'L20');
    //setSymmetricWall(3, 5, 'vertical', 'x', 'L20');
    setSymmetricWall(3, 4, 'vertical', 'x', 'L20');
    setSymmetricWall(5, 6, 'horizontal', 'x', 'L21');
    setSymmetricWall(6, 6, 'horizontal', 'x', 'L21');
    // Ghost House
    (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(25, 2, 'horizontal', 'GH_TOP');
    (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(27, 2, 'horizontal', 'GH_TOP');
    (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(25, 4, 'horizontal', 'GH_BOTTOM');
    (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(26, 4, 'horizontal', 'GH_BOTTOM');
    (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(27, 4, 'horizontal', 'GH_BOTTOM');
    (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(25, 3, 'vertical', 'GH_LEFT');
    (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(28, 3, 'vertical', 'GH_RIGHT');
    (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(25, 2, 'vertical', 'GH_LEFT');
    (0,_core_constants__WEBPACK_IMPORTED_MODULE_0__.setWall)(28, 2, 'vertical', 'GH_RIGHT');
};
const Grid = {
    buildWalls
};


/***/ },

/***/ "./src/puzzle-bobble/core/constants.ts"
/*!*********************************************!*\
  !*** ./src/puzzle-bobble/core/constants.ts ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BUBBLE_RADIUS: () => (/* binding */ BUBBLE_RADIUS),
/* harmony export */   BUBBLE_SPEED: () => (/* binding */ BUBBLE_SPEED),
/* harmony export */   CANNON_ANGLE_MAX: () => (/* binding */ CANNON_ANGLE_MAX),
/* harmony export */   CANNON_ANGLE_MIN: () => (/* binding */ CANNON_ANGLE_MIN),
/* harmony export */   CANNON_AREA_HEIGHT: () => (/* binding */ CANNON_AREA_HEIGHT),
/* harmony export */   CANNON_TURN_SPEED: () => (/* binding */ CANNON_TURN_SPEED),
/* harmony export */   CANNON_Y_OFFSET: () => (/* binding */ CANNON_Y_OFFSET),
/* harmony export */   CELL_SIZE: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.CELL_SIZE),
/* harmony export */   DELTA_TIME: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.DELTA_TIME),
/* harmony export */   GAME_THEMES: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GAME_THEMES),
/* harmony export */   GAP_SIZE: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GAP_SIZE),
/* harmony export */   GRID_HEIGHT: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT),
/* harmony export */   GRID_WIDTH: () => (/* reexport safe */ _shared_constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH),
/* harmony export */   PB_ANIM_SPEED_FACTOR: () => (/* binding */ PB_ANIM_SPEED_FACTOR),
/* harmony export */   PB_COLORS: () => (/* binding */ PB_COLORS),
/* harmony export */   POP_BURST_FRAMES: () => (/* binding */ POP_BURST_FRAMES),
/* harmony export */   POP_MIN_CLUSTER: () => (/* binding */ POP_MIN_CLUSTER)
/* harmony export */ });
/* harmony import */ var _shared_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/constants */ "./src/shared/constants.ts");
/* ─── Re-export shared constants so puzzle-bobble code has one import location ─── */

/* ───────────── Cannon ───────────── */
/** SVG-space X of the cannon (horizontally centered on the grid) */
const CANNON_Y_OFFSET = 55; // px below grid bottom, within cannon area
/** Min/max cannon angle in degrees (90 = straight up) */
const CANNON_ANGLE_MIN = 10;
const CANNON_ANGLE_MAX = 170;
/** Cannon turn speed in degrees per frame */
const CANNON_TURN_SPEED = 6;
/* ───────────── Bubble physics ───────────── */
/** Bubble travel speed in SVG pixels per frame */
const BUBBLE_SPEED = 10;
/** Radius of a bubble in SVG pixels (slightly smaller than half CELL_SIZE so it fits) */
const BUBBLE_RADIUS = 9;
/* ───────────── Pop logic ───────────── */
/** Minimum connected same-color cluster size to trigger a pop */
const POP_MIN_CLUSTER = 3;
/** Number of frames the pop burst animation lasts */
const POP_BURST_FRAMES = 8;
/* ───────────── Cannon area ───────────── */
/** Height in SVG pixels reserved below the grid for the cannon */
const CANNON_AREA_HEIGHT = 80;
/** Divisor applied to total frame count when computing SVG animation duration.
 *  Higher = faster playback. */
const PB_ANIM_SPEED_FACTOR = 6;
/* ───────────── Bubble palette ───────────── */
/**
 * Fixed 6-colour palette used for Puzzle Bobble bubbles.
 * A subset of these is used depending on how many cells are occupied:
 * ≤50 → 2 colours, ≤150 → 3, ≤250 → 4, ≤350 → 5, >350 → 6
 */
const PB_COLORS = [
    '#e74c3c',
    '#f1c40f',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#e67e22' // orange
];


/***/ },

/***/ "./src/puzzle-bobble/core/game.ts"
/*!****************************************!*\
  !*** ./src/puzzle-bobble/core/game.ts ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PuzzleBobbleGame: () => (/* binding */ PuzzleBobbleGame)
/* harmony export */ });
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _renderers_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../renderers/svg */ "./src/puzzle-bobble/renderers/svg.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "./src/puzzle-bobble/core/constants.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/* ────────────────── Coord helpers ────────────────── */
/** Center SVG-x of grid column col */
const cellCx = (col) => col * (_constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE + _constants__WEBPACK_IMPORTED_MODULE_2__.GAP_SIZE) + _constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE / 2;
/** Center SVG-y of grid row row */
const cellCy = (row) => row * (_constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE + _constants__WEBPACK_IMPORTED_MODULE_2__.GAP_SIZE) + 15 + _constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE / 2;
/** Column index from SVG x (clamped) */
const svgXToCol = (x) => Math.round((x - _constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE / 2) / (_constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE + _constants__WEBPACK_IMPORTED_MODULE_2__.GAP_SIZE));
/** Row index from SVG y */
const svgYToRow = (y) => Math.round((y - 15 - _constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE / 2) / (_constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE + _constants__WEBPACK_IMPORTED_MODULE_2__.GAP_SIZE));
/* ────────────────── Grid helpers ────────────────── */
const hasRemainingBubbles = (store) => store.grid.some((col) => col.some((cell) => cell.commitsCount > 0));
/** Return all cells reachable from (startCol, startRow) sharing the same color index (flood-fill, 4-dir). */
const floodFillSameColor = (store, startCol, startRow, colorIdx) => {
    var _a, _b, _c;
    const visited = new Set();
    const result = [];
    const stack = [{ x: startCol, y: startRow }];
    while (stack.length) {
        const { x, y } = stack.pop();
        const key = `${x},${y}`;
        if (visited.has(key))
            continue;
        if (x < 0 || x >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH || y < 0 || y >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT)
            continue;
        const cell = (_a = store.grid[x]) === null || _a === void 0 ? void 0 : _a[y];
        if (!cell || cell.commitsCount === 0)
            continue;
        if (((_c = (_b = store.cellBubbleColors[x]) === null || _b === void 0 ? void 0 : _b[y]) !== null && _c !== void 0 ? _c : -1) !== colorIdx)
            continue;
        visited.add(key);
        result.push({ x, y });
        stack.push({ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 });
    }
    return result;
};
/** Return all cells connected (4-dir, any non-NONE) to row 0 — these are "anchored". */
const findAnchoredCells = (store) => {
    var _a, _b, _c;
    const anchored = new Set();
    const stack = [];
    for (let x = 0; x < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH; x++) {
        if (((_b = (_a = store.grid[x]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.commitsCount) > 0) {
            stack.push({ x, y: 0 });
        }
    }
    while (stack.length) {
        const { x, y } = stack.pop();
        const key = `${x},${y}`;
        if (anchored.has(key))
            continue;
        if (x < 0 || x >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH || y < 0 || y >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT)
            continue;
        if (!((_c = store.grid[x]) === null || _c === void 0 ? void 0 : _c[y]) || store.grid[x][y].commitsCount === 0)
            continue;
        anchored.add(key);
        stack.push({ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 });
    }
    return anchored;
};
/* ────────────────── AI: pick next shot ────────────────── */
/**
 * Simulate bubble path (with wall bounces) and return the grid cell it lands in,
 * plus the final angle used.
 */
const simulateShot = (startX, startY, angleDeg, store) => {
    var _a, _b, _c, _d;
    const rad = (angleDeg * Math.PI) / 180;
    let vx = _constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_SPEED * Math.cos(rad);
    let vy = -_constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_SPEED * Math.sin(rad); // up = negative y
    const svgWidth = _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH * (_constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE + _constants__WEBPACK_IMPORTED_MODULE_2__.GAP_SIZE);
    let x = startX;
    let y = startY;
    for (let step = 0; step < 2000; step++) {
        x += vx;
        y += vy;
        // Wall bounce
        if (x < _constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_RADIUS) {
            x = _constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_RADIUS;
            vx = Math.abs(vx);
        }
        if (x > svgWidth - _constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_RADIUS) {
            x = svgWidth - _constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_RADIUS;
            vx = -Math.abs(vx);
        }
        // Off top → miss
        if (y < 0)
            return null;
        const col = svgXToCol(x);
        const row = svgYToRow(y);
        if (row < 0 || row >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT || col < 0 || col >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH)
            continue;
        // Check if bubble center is close enough to a filled cell
        for (const [dc, dr] of [
            [0, 0],
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ]) {
            const nc = col + dc;
            const nr = row + dr;
            if (nc < 0 || nc >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH || nr < 0 || nr >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT)
                continue;
            if (((_b = (_a = store.grid[nc]) === null || _a === void 0 ? void 0 : _a[nr]) === null || _b === void 0 ? void 0 : _b.commitsCount) > 0) {
                const cx = cellCx(nc);
                const cy = cellCy(nr);
                const dist = Math.hypot(x - cx, y - cy);
                if (dist < _constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE) {
                    // Land in adjacent empty cell toward the shot direction
                    const landCol = Math.max(0, Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - 1, svgXToCol(x)));
                    const landRow = Math.max(0, Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT - 1, svgYToRow(y)));
                    return { col: landCol, row: landRow };
                }
            }
        }
        // Hit first row ceiling
        if (row === 0 && ((_d = (_c = store.grid[col]) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.commitsCount) === 0) {
            return { col: Math.max(0, Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - 1, col)), row: 0 };
        }
    }
    return null;
};
/**
 * Choose an angle for the next shot of `bubbleColorIdx`.
 *
 * Priority tiers (stable per-shot seed = nextBubbleId):
 *   1. Pop: lands adjacent to ≥(POP_MIN_CLUSTER-1) same-color cells → cluster pops
 *   2. Build: lands adjacent to at least 1 same-color cell (within 2 rows)
 *   3. Any:  lands adjacent to any occupied cell (within 2 rows)
 *   4. Closest: no adjacency found → pick the angle whose landing is geometrically
 *      closest to any remaining occupied cell (avoids wasting shots at empty ceiling)
 */
const chooseBestAngle = (store, cannonSvgX, cannonSvgY, bubbleColorIdx) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const seed = (store.nextBubbleId * 1664525 + 1013904223) >>> 0;
    const popCandidates = [];
    const sameColorCandidates = [];
    const anyCandidates = [];
    // Wider neighbourhood: same row ±1 col, plus up to 2 rows below (row+1, row+2)
    const NEIGHBOURHOOD = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, 1],
        [0, 1],
        [1, 1],
        [-1, 2],
        [0, 2],
        [1, 2]
    ];
    for (let angleDeg = _constants__WEBPACK_IMPORTED_MODULE_2__.CANNON_ANGLE_MIN + 2; angleDeg <= _constants__WEBPACK_IMPORTED_MODULE_2__.CANNON_ANGLE_MAX - 2; angleDeg += 2) {
        const hit = simulateShot(cannonSvgX, cannonSvgY, angleDeg, store);
        if (!hit)
            continue;
        if (((_c = (_b = (_a = store.grid[hit.col]) === null || _a === void 0 ? void 0 : _a[hit.row]) === null || _b === void 0 ? void 0 : _b.commitsCount) !== null && _c !== void 0 ? _c : 0) > 0)
            continue;
        let hasSameColorAdj = false;
        let hasAnyAdj = false;
        let bestCluster = 0;
        for (const [dc, dr] of NEIGHBOURHOOD) {
            const nc = hit.col + dc;
            const nr = hit.row + dr;
            if (nc < 0 || nc >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH || nr < 0 || nr >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT)
                continue;
            if (((_f = (_e = (_d = store.grid[nc]) === null || _d === void 0 ? void 0 : _d[nr]) === null || _e === void 0 ? void 0 : _e.commitsCount) !== null && _f !== void 0 ? _f : 0) === 0)
                continue;
            hasAnyAdj = true;
            if (((_h = (_g = store.cellBubbleColors[nc]) === null || _g === void 0 ? void 0 : _g[nr]) !== null && _h !== void 0 ? _h : -1) === bubbleColorIdx) {
                hasSameColorAdj = true;
                const sz = floodFillSameColor(store, nc, nr, bubbleColorIdx).length + 1;
                if (sz > bestCluster)
                    bestCluster = sz;
            }
        }
        if (bestCluster >= _constants__WEBPACK_IMPORTED_MODULE_2__.POP_MIN_CLUSTER) {
            popCandidates.push({ angleDeg, score: bestCluster });
        }
        else if (hasSameColorAdj) {
            sameColorCandidates.push(angleDeg);
        }
        else if (hasAnyAdj) {
            anyCandidates.push(angleDeg);
        }
    }
    if (popCandidates.length > 0) {
        const maxScore = Math.max(...popCandidates.map((c) => c.score));
        const best = popCandidates.filter((c) => c.score === maxScore);
        return best[seed % best.length].angleDeg;
    }
    if (sameColorCandidates.length > 0) {
        return sameColorCandidates[seed % sameColorCandidates.length];
    }
    if (anyCandidates.length > 0) {
        return anyCandidates[seed % anyCandidates.length];
    }
    // Tier 4: no adjacency at all — aim the landing as close as possible to any filled cell
    let closestAngle = 90;
    let closestDist = Infinity;
    for (let angleDeg = _constants__WEBPACK_IMPORTED_MODULE_2__.CANNON_ANGLE_MIN + 2; angleDeg <= _constants__WEBPACK_IMPORTED_MODULE_2__.CANNON_ANGLE_MAX - 2; angleDeg += 2) {
        const hit = simulateShot(cannonSvgX, cannonSvgY, angleDeg, store);
        if (!hit)
            continue;
        if (((_l = (_k = (_j = store.grid[hit.col]) === null || _j === void 0 ? void 0 : _j[hit.row]) === null || _k === void 0 ? void 0 : _k.commitsCount) !== null && _l !== void 0 ? _l : 0) > 0)
            continue;
        const lx = cellCx(hit.col);
        const ly = cellCy(hit.row);
        let minDist = Infinity;
        for (let x = 0; x < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH; x++) {
            for (let y = 0; y < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT; y++) {
                if (((_p = (_o = (_m = store.grid[x]) === null || _m === void 0 ? void 0 : _m[y]) === null || _o === void 0 ? void 0 : _o.commitsCount) !== null && _p !== void 0 ? _p : 0) > 0) {
                    const d = Math.hypot(lx - cellCx(x), ly - cellCy(y));
                    if (d < minDist)
                        minDist = d;
                }
            }
        }
        if (minDist < closestDist) {
            closestDist = minDist;
            closestAngle = angleDeg;
        }
    }
    return closestAngle;
};
/* ────────────────── Snapshot ────────────────── */
const pushSnapshot = (store) => {
    store.gameHistory.push({
        cannon: Object.assign({}, store.cannon),
        activeBubble: store.activeBubble ? Object.assign({}, store.activeBubble) : null,
        nextBubbleColorIndex: store.nextBubbleColorIndex,
        currentBubbleColorIndex: store.currentBubbleColorIndex
    });
};
/* ────────────────── Game lifecycle ────────────────── */
const startGame = (store) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    store.frameCount = 0;
    store.nextBubbleId = 0;
    store.gameHistory = [];
    store.cellEvents = [];
    store.popEvents = [];
    store.activeBubble = null;
    store.grid = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.createGridFromData(store);
    // Assign fixed palette colors to occupied cells
    const _theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getCurrentTheme(store);
    const _noneColor = _theme.intensityColors[0];
    const _occupied = [];
    for (let _x = 0; _x < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH; _x++) {
        for (let _y = 0; _y < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT; _y++) {
            if (store.grid[_x][_y].commitsCount > 0)
                _occupied.push({ x: _x, y: _y });
        }
    }
    const _numColors = _occupied.length <= 50 ? 2 : _occupied.length <= 150 ? 3 : _occupied.length <= 250 ? 4 : _occupied.length <= 350 ? 5 : 6;
    // ── Seeded RNG (LCG) ────────────────────────────────────────────────
    let _rngState = (_occupied.length * 2654435761) >>> 0;
    const _rng = () => {
        _rngState = (Math.imul(_rngState, 1664525) + 1013904223) >>> 0;
        return _rngState / 0x100000000;
    };
    store.cellBubbleColors = Array.from({ length: _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH }, () => new Array(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT).fill(-1));
    // Step 1: random initial assignment
    for (const { x: _x, y: _y } of _occupied) {
        store.cellBubbleColors[_x][_y] = Math.floor(_rng() * _numColors);
    }
    // Step 2: 3 rounds of majority-vote smoothing → natural color clusters
    for (let _round = 0; _round < 3; _round++) {
        const _prev = store.cellBubbleColors.map((col) => [...col]);
        for (const { x: _x, y: _y } of _occupied) {
            const _counts = new Array(_numColors).fill(0);
            let _total = 0;
            for (const [_dx, _dy] of [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
                [-1, -1],
                [1, -1],
                [-1, 1],
                [1, 1]
            ]) {
                const _ni = (_b = (_a = _prev[_x + _dx]) === null || _a === void 0 ? void 0 : _a[_y + _dy]) !== null && _b !== void 0 ? _b : -1;
                if (_ni >= 0) {
                    _counts[_ni]++;
                    _total++;
                }
            }
            if (_total > 0) {
                const _max = Math.max(..._counts);
                // Switch only when neighbours strongly agree (≥50 %) to preserve some variety
                if (_max >= _total * 0.5) {
                    store.cellBubbleColors[_x][_y] = _counts.indexOf(_max);
                }
            }
        }
    }
    // Apply palette color back to grid cells
    for (const { x: _x, y: _y } of _occupied) {
        const _ci = store.cellBubbleColors[_x][_y];
        store.grid[_x][_y] = Object.assign(Object.assign({}, store.grid[_x][_y]), { color: _constants__WEBPACK_IMPORTED_MODULE_2__.PB_COLORS[_ci] });
    }
    store.initialColors = store.grid.map((col) => col.map((cell) => (cell.commitsCount > 0 ? cell.color : _noneColor)));
    // Initialise next-bubble color (random from occupied palette)
    const _availableCI = [...new Set(_occupied.map(({ x, y }) => store.cellBubbleColors[x][y]))];
    store.nextBubbleColorIndex = (_c = _availableCI[Math.floor(_rng() * _availableCI.length)]) !== null && _c !== void 0 ? _c : 0;
    if (!hasRemainingBubbles(store)) {
        const svg = _renderers_svg__WEBPACK_IMPORTED_MODULE_1__.PuzzleBobblesVG.generateAnimatedSVG(store);
        store.config.svgCallback(svg);
        store.config.gameOverCallback();
        return;
    }
    store.cannon = { angleDeg: 90 };
    store.cannonTargetAngle = -1;
    store.currentBubbleColorIndex = store.nextBubbleColorIndex;
    const MAX_FRAMES = 5000;
    while (hasRemainingBubbles(store) && store.frameCount < MAX_FRAMES) {
        updateGame(store);
    }
    const svg = _renderers_svg__WEBPACK_IMPORTED_MODULE_1__.PuzzleBobblesVG.generateAnimatedSVG(store);
    store.config.svgCallback(svg);
    if (store.config.gameStatsCallback) {
        store.config.gameStatsCallback({
            totalScore: store.cellEvents.length,
            steps: store.frameCount,
            ghostsEaten: 0
        });
    }
    store.config.gameOverCallback();
});
const stopGame = (_store) => { };
/* ────────────────── Per-frame update ────────────────── */
const updateGame = (store) => {
    var _a, _b, _c, _d, _e, _f, _g;
    store.frameCount++;
    const svgWidth = _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH * (_constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE + _constants__WEBPACK_IMPORTED_MODULE_2__.GAP_SIZE);
    const gridBottomY = _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT * (_constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE + _constants__WEBPACK_IMPORTED_MODULE_2__.GAP_SIZE) + 15;
    const cannonSvgX = svgWidth / 2;
    const cannonSvgY = gridBottomY + 30; // cannon center
    // ── No active bubble: aim and fire ───────────────────────────────────
    if (!store.activeBubble) {
        // Compute target angle once per shot (stable during rotation)
        if (store.cannonTargetAngle === -1) {
            store.cannonTargetAngle = chooseBestAngle(store, cannonSvgX, cannonSvgY, store.nextBubbleColorIndex);
        }
        const targetAngle = store.cannonTargetAngle;
        store.currentBubbleColorIndex = store.nextBubbleColorIndex;
        // Rotate cannon toward target (up to CANNON_TURN_SPEED per frame)
        const diff = targetAngle - store.cannon.angleDeg;
        if (Math.abs(diff) <= _constants__WEBPACK_IMPORTED_MODULE_2__.CANNON_TURN_SPEED) {
            store.cannon.angleDeg = targetAngle;
        }
        else {
            store.cannon.angleDeg += Math.sign(diff) * _constants__WEBPACK_IMPORTED_MODULE_2__.CANNON_TURN_SPEED;
            store.cannon.angleDeg = Math.max(_constants__WEBPACK_IMPORTED_MODULE_2__.CANNON_ANGLE_MIN, Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.CANNON_ANGLE_MAX, store.cannon.angleDeg));
            pushSnapshot(store);
            return;
        }
        // Fire the pre-selected bubble color
        const chosenColorIdx = store.nextBubbleColorIndex;
        store.currentBubbleColorIndex = chosenColorIdx;
        store.cannonTargetAngle = -1; // will recompute after this bubble lands
        // Pre-pick the NEXT bubble's color: random from colors still on the board
        const _existingCI = new Set();
        for (let _x = 0; _x < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH; _x++) {
            for (let _y = 0; _y < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT; _y++) {
                if (store.grid[_x][_y].commitsCount > 0)
                    _existingCI.add((_b = (_a = store.cellBubbleColors[_x]) === null || _a === void 0 ? void 0 : _a[_y]) !== null && _b !== void 0 ? _b : 0);
            }
        }
        const _ciList = [..._existingCI];
        if (_ciList.length > 0) {
            const _seed = (store.frameCount * 1664525 + 1013904223) >>> 0;
            store.nextBubbleColorIndex = _ciList[_seed % _ciList.length];
        }
        const rad = (store.cannon.angleDeg * Math.PI) / 180;
        store.activeBubble = {
            id: store.nextBubbleId++,
            x: cannonSvgX,
            y: cannonSvgY,
            vx: _constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_SPEED * Math.cos(rad),
            vy: -_constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_SPEED * Math.sin(rad),
            colorIndex: chosenColorIdx,
            active: true
        };
        pushSnapshot(store);
        return;
    }
    // ── Move active bubble ───────────────────────────────────────────────
    const bubble = store.activeBubble;
    bubble.x += bubble.vx;
    bubble.y += bubble.vy;
    // Wall bounces
    if (bubble.x < _constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_RADIUS) {
        bubble.x = _constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_RADIUS;
        bubble.vx = Math.abs(bubble.vx);
    }
    if (bubble.x > svgWidth - _constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_RADIUS) {
        bubble.x = svgWidth - _constants__WEBPACK_IMPORTED_MODULE_2__.BUBBLE_RADIUS;
        bubble.vx = -Math.abs(bubble.vx);
    }
    // Off top or bottom — discard
    if (bubble.y < 0 || bubble.y > cannonSvgY + 10) {
        store.activeBubble = null;
        store.cannonTargetAngle = -1;
        pushSnapshot(store);
        return;
    }
    // ── Collision detection ──────────────────────────────────────────────
    let landed = false;
    let landCol = -1;
    let landRow = -1;
    const bCol = svgXToCol(bubble.x);
    const bRow = svgYToRow(bubble.y);
    // Check proximity to every neighbor cell
    outer: for (let dc = -1; dc <= 1; dc++) {
        for (let dr = -1; dr <= 1; dr++) {
            const nc = bCol + dc;
            const nr = bRow + dr;
            if (nc < 0 || nc >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH || nr < 0 || nr >= _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT)
                continue;
            const cx = cellCx(nc);
            const cy = cellCy(nr);
            const dist = Math.hypot(bubble.x - cx, bubble.y - cy);
            if (dist < _constants__WEBPACK_IMPORTED_MODULE_2__.CELL_SIZE * 0.9) {
                // Filled cell → land in the adjacent empty slot toward the shooter
                if (((_d = (_c = store.grid[nc]) === null || _c === void 0 ? void 0 : _c[nr]) === null || _d === void 0 ? void 0 : _d.commitsCount) > 0) {
                    // Land in bCol/bRow if empty, otherwise find nearest empty neighbor
                    if (((_f = (_e = store.grid[bCol]) === null || _e === void 0 ? void 0 : _e[bRow]) === null || _f === void 0 ? void 0 : _f.commitsCount) === 0 && bCol >= 0 && bCol < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH && bRow >= 0 && bRow < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT) {
                        landCol = bCol;
                        landRow = bRow;
                    }
                    else {
                        // Find first empty neighbor
                        for (const [edc, edr] of [
                            [0, 1],
                            [-1, 0],
                            [1, 0],
                            [0, -1]
                        ]) {
                            const ec = nc + edc;
                            const er = nr + edr;
                            if (ec >= 0 && ec < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH && er >= 0 && er < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT && store.grid[ec][er].commitsCount === 0) {
                                landCol = ec;
                                landRow = er;
                                break;
                            }
                        }
                    }
                    landed = true;
                    break outer;
                }
                // Empty cell that's at row 0 (ceiling)
                if (nr === 0) {
                    landCol = nc;
                    landRow = 0;
                    landed = true;
                    break outer;
                }
            }
        }
    }
    // Ceiling collision
    if (!landed && bRow <= 0 && bCol >= 0 && bCol < _constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH) {
        landCol = bCol;
        landRow = 0;
        landed = true;
    }
    if (landed && landCol >= 0 && landRow >= 0) {
        landCol = Math.max(0, Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_WIDTH - 1, landCol));
        landRow = Math.max(0, Math.min(_constants__WEBPACK_IMPORTED_MODULE_2__.GRID_HEIGHT - 1, landRow));
        // Place bubble in the grid
        const theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getCurrentTheme(store);
        const noneColor = theme.intensityColors[0];
        const bubbleColor = ((_g = _constants__WEBPACK_IMPORTED_MODULE_2__.PB_COLORS[bubble.colorIndex]) !== null && _g !== void 0 ? _g : _constants__WEBPACK_IMPORTED_MODULE_2__.PB_COLORS[0]);
        store.grid[landCol][landRow] = {
            commitsCount: 1,
            color: bubbleColor,
            level: 'FIRST_QUARTILE'
        };
        store.cellBubbleColors[landCol][landRow] = bubble.colorIndex;
        // Record color event
        store.cellEvents.push({
            frameIndex: store.gameHistory.length,
            x: landCol,
            y: landRow,
            color: bubbleColor
        });
        // ── Pop check ────────────────────────────────────────────────────
        const cluster = floodFillSameColor(store, landCol, landRow, bubble.colorIndex);
        if (cluster.length >= _constants__WEBPACK_IMPORTED_MODULE_2__.POP_MIN_CLUSTER) {
            const popColor = bubbleColor;
            // Clear only the same-color cluster — no cascade drop
            for (const { x, y } of cluster) {
                store.grid[x][y] = {
                    commitsCount: 0,
                    color: noneColor,
                    level: 'NONE'
                };
                store.cellBubbleColors[x][y] = -1;
                store.cellEvents.push({
                    frameIndex: store.gameHistory.length,
                    x,
                    y,
                    color: noneColor
                });
            }
            // Record pop event (cluster only — no cascade)
            store.popEvents.push({
                frameIndex: store.gameHistory.length,
                cells: cluster,
                color: popColor
            });
            store.config.pointsIncreasedCallback(store.cellEvents.length);
        }
        store.activeBubble = null;
        store.cannonTargetAngle = -1;
    }
    pushSnapshot(store);
};
const PuzzleBobbleGame = { startGame, stopGame };


/***/ },

/***/ "./src/puzzle-bobble/core/store.ts"
/*!*****************************************!*\
  !*** ./src/puzzle-bobble/core/store.ts ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PuzzleBobbleStore: () => (/* binding */ PuzzleBobbleStore)
/* harmony export */ });
const PuzzleBobbleStore = {
    frameCount: 0,
    nextBubbleId: 0,
    nextBubbleColorIndex: 0,
    currentBubbleColorIndex: 0,
    cannonTargetAngle: -1,
    contributions: [],
    cannon: { angleDeg: 90 },
    activeBubble: null,
    grid: [],
    monthLabels: [],
    gameHistory: [],
    initialColors: [],
    cellBubbleColors: [],
    cellEvents: [],
    popEvents: [],
    config: undefined
};


/***/ },

/***/ "./src/puzzle-bobble/index.ts"
/*!************************************!*\
  !*** ./src/puzzle-bobble/index.ts ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PuzzleBobbleRenderer: () => (/* binding */ PuzzleBobbleRenderer)
/* harmony export */ });
/* harmony import */ var _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shared/providers/providers */ "./src/shared/providers/providers.ts");
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _core_game__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/game */ "./src/puzzle-bobble/core/game.ts");
/* harmony import */ var _core_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/store */ "./src/puzzle-bobble/core/store.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




class PuzzleBobbleRenderer {
    constructor(conf) {
        this.conf = Object.assign({}, conf);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultConfig = {
                platform: 'github',
                username: '',
                svgCallback: (_) => { },
                gameOverCallback: () => { },
                gameTheme: 'github',
                pointsIncreasedCallback: (_) => { },
                githubSettings: { accessToken: '' }
            };
            this.store = JSON.parse(JSON.stringify(_core_store__WEBPACK_IMPORTED_MODULE_3__.PuzzleBobbleStore));
            this.store.config = Object.assign(Object.assign({}, defaultConfig), this.conf);
            switch (this.store.config.platform) {
                case 'gitlab':
                    this.store.contributions = yield _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__.Providers.fetchGitlabContributions(this.store);
                    break;
                case 'github':
                    this.store.contributions = yield _shared_providers_providers__WEBPACK_IMPORTED_MODULE_0__.Providers.fetchGithubContributions(this.store);
                    break;
                default:
                    throw new Error(`Unsupported platform: ${this.store.config.platform}`);
            }
            _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.buildGrid(this.store);
            _shared_utils_utils__WEBPACK_IMPORTED_MODULE_1__.Utils.buildMonthLabels(this.store);
            yield _core_game__WEBPACK_IMPORTED_MODULE_2__.PuzzleBobbleGame.startGame(this.store);
            return this.store;
        });
    }
    stop() {
        _core_game__WEBPACK_IMPORTED_MODULE_2__.PuzzleBobbleGame.stopGame(this.store);
    }
}


/***/ },

/***/ "./src/puzzle-bobble/renderers/svg.ts"
/*!********************************************!*\
  !*** ./src/puzzle-bobble/renderers/svg.ts ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PuzzleBobblesVG: () => (/* binding */ PuzzleBobblesVG)
/* harmony export */ });
/* harmony import */ var _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shared/utils/utils */ "./src/shared/utils/utils.ts");
/* harmony import */ var _core_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/constants */ "./src/puzzle-bobble/core/constants.ts");


const SVG_PRECISION = 4;
/** Center SVG-x of grid column */
const toSvgCx = (col) => col * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2;
/** Center SVG-y of grid row */
const toSvgCy = (row) => row * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + 15 + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2;
const trackPush = (track, t, v) => {
    if (track.keyTimes.length === 0 || t !== track.keyTimes[track.keyTimes.length - 1]) {
        track.keyTimes.push(t);
        track.values.push(v);
    }
    else {
        track.values[track.values.length - 1] = v;
    }
};
const finishTrack = (track) => {
    if (track.keyTimes[track.keyTimes.length - 1] !== 1) {
        track.keyTimes.push(1);
        track.values.push(track.values[track.values.length - 1]);
    }
    return {
        keyTimes: track.keyTimes.join(';'),
        values: track.values.join(';')
    };
};
const t = (frameIdx, totalFrames) => Number((frameIdx / Math.max(totalFrames - 1, 1)).toFixed(SVG_PRECISION));
/* ────────────────── Cell animation ────────────────── */
const getCellAnimData = (store, x, y, noneColor) => {
    var _a, _b;
    const totalFrames = store.gameHistory.length;
    const initialColor = (_b = (_a = store.initialColors[x]) === null || _a === void 0 ? void 0 : _a[y]) !== null && _b !== void 0 ? _b : noneColor;
    const events = store.cellEvents.filter((e) => e.x === x && e.y === y);
    if (events.length === 0) {
        return { keyTimes: '0;1', values: `${initialColor};${initialColor}` };
    }
    const track = { keyTimes: [0], values: [initialColor] };
    for (const ev of events) {
        const ti = t(ev.frameIndex, totalFrames);
        trackPush(track, ti, ev.color);
    }
    return finishTrack(track);
};
const extractBubbleFlights = (store) => {
    const flights = [];
    const active = new Map();
    for (let f = 0; f < store.gameHistory.length; f++) {
        const ab = store.gameHistory[f].activeBubble;
        // Close flights no longer active
        for (const [id, flight] of active) {
            if (!ab || ab.id !== id) {
                flights.push({
                    id,
                    colorIndex: flight.colorIndex,
                    startFrame: flight.startFrame,
                    endFrame: f - 1,
                    xPositions: flight.xs,
                    yPositions: flight.ys
                });
                active.delete(id);
            }
        }
        if (ab && ab.active) {
            if (!active.has(ab.id)) {
                active.set(ab.id, { colorIndex: ab.colorIndex, startFrame: f, xs: [ab.x], ys: [ab.y] });
            }
            else {
                const fl = active.get(ab.id);
                fl.xs.push(ab.x);
                fl.ys.push(ab.y);
            }
        }
    }
    for (const [id, flight] of active) {
        flights.push({
            id,
            colorIndex: flight.colorIndex,
            startFrame: flight.startFrame,
            endFrame: store.gameHistory.length - 1,
            xPositions: flight.xs,
            yPositions: flight.ys
        });
    }
    return flights;
};
/* ────────────────── Main SVG generator ────────────────── */
const generateAnimatedSVG = (store) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const svgWidth = _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE);
    const svgHeight = _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + 15 + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CANNON_AREA_HEIGHT;
    const totalFrames = store.gameHistory.length;
    const totalDurationMs = Math.max((totalFrames * _core_constants__WEBPACK_IMPORTED_MODULE_1__.DELTA_TIME) / _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_ANIM_SPEED_FACTOR, 1000);
    const dur = `${totalDurationMs}ms`;
    const theme = _shared_utils_utils__WEBPACK_IMPORTED_MODULE_0__.Utils.getCurrentTheme(store);
    const noneColor = theme.intensityColors[0];
    // SVG canvas
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<desc>Generated with puzzle-bobble-contribution-graph on ${new Date()}</desc>`;
    // Background
    svg += `<rect width="100%" height="100%" fill="${theme.gridBackground}"/>`;
    // ── Month labels ─────────────────────────────────────────────────────
    let lastMonth = '';
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH; x++) {
        if (store.monthLabels[x] !== lastMonth) {
            const xPos = x * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + _core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE / 2;
            svg += `<text x="${xPos}" y="10" text-anchor="middle" font-size="10" fill="${theme.textColor}">${store.monthLabels[x]}</text>`;
            lastMonth = store.monthLabels[x];
        }
    }
    // ── Grid cells as circles (bubbles) ──────────────────────────────────
    for (let x = 0; x < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_WIDTH; x++) {
        for (let y = 0; y < _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT; y++) {
            const cx = toSvgCx(x);
            const cy = toSvgCy(y);
            const anim = getCellAnimData(store, x, y, noneColor);
            svg += `<circle cx="${cx}" cy="${cy}" r="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BUBBLE_RADIUS}" fill="${noneColor}">
				<animate attributeName="fill" calcMode="discrete" dur="${dur}" repeatCount="indefinite"
					values="${anim.values}" keyTimes="${anim.keyTimes}"/>
			</circle>`;
        }
    }
    // ── Flying bubbles (shots from cannon) ───────────────────────────────
    if (totalFrames >= 2) {
        const flights = extractBubbleFlights(store);
        for (const flight of flights) {
            const tStart = Number((flight.startFrame / (totalFrames - 1)).toFixed(SVG_PRECISION));
            const tEnd = Number((Math.min(flight.endFrame + 1, totalFrames - 1) / (totalFrames - 1)).toFixed(SVG_PRECISION));
            const color = ((_a = _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_COLORS[flight.colorIndex]) !== null && _a !== void 0 ? _a : _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_COLORS[0]);
            // Opacity (discrete)
            let opKt, opVals;
            if (tStart <= 0 && tEnd >= 1) {
                opKt = '0;1';
                opVals = '1;1';
            }
            else if (tStart <= 0) {
                opKt = `0;${tEnd};${tEnd};1`;
                opVals = '1;1;0;0';
            }
            else if (tEnd >= 1) {
                opKt = `0;${tStart};${tStart};1`;
                opVals = '0;0;1;1';
            }
            else {
                opKt = `0;${tStart};${tStart};${tEnd};${tEnd};1`;
                opVals = '0;0;1;1;0;0';
            }
            // Position keyTimes/values (linear)
            const posKts = [];
            const posVals = [];
            const firstX = flight.xPositions[0].toFixed(1);
            const firstY = flight.yPositions[0].toFixed(1);
            if (flight.startFrame > 0) {
                posKts.push(0);
                posVals.push(`${firstX},${firstY}`);
            }
            for (let i = 0; i < flight.xPositions.length; i++) {
                const fi = flight.startFrame + i;
                const ti = Number((fi / (totalFrames - 1)).toFixed(SVG_PRECISION));
                const px = flight.xPositions[i].toFixed(1);
                const py = flight.yPositions[i].toFixed(1);
                if (posKts.length === 0 || ti !== posKts[posKts.length - 1]) {
                    posKts.push(ti);
                    posVals.push(`${px},${py}`);
                }
            }
            if (posKts[posKts.length - 1] !== 1) {
                const lx = flight.xPositions[flight.xPositions.length - 1].toFixed(1);
                const ly = flight.yPositions[flight.yPositions.length - 1].toFixed(1);
                posKts.push(1);
                posVals.push(`${lx},${ly}`);
            }
            svg += `<circle cx="0" cy="0" r="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BUBBLE_RADIUS}" fill="${color}" opacity="0" stroke="white" stroke-width="1" stroke-opacity="0.4">
				<animate attributeName="opacity" calcMode="discrete" dur="${dur}" repeatCount="indefinite"
					keyTimes="${opKt}" values="${opVals}"/>
				<animateTransform attributeName="transform" type="translate" calcMode="linear"
					dur="${dur}" repeatCount="indefinite"
					keyTimes="${posKts.join(';')}" values="${posVals.join(';')}"/>
			</circle>`;
        }
    }
    // ── Pop burst effects ────────────────────────────────────────────────
    if (totalFrames >= 2) {
        for (const pop of store.popEvents) {
            const tS = Number((pop.frameIndex / (totalFrames - 1)).toFixed(SVG_PRECISION));
            const tE = Number((Math.min(pop.frameIndex + _core_constants__WEBPACK_IMPORTED_MODULE_1__.POP_BURST_FRAMES, totalFrames - 1) / (totalFrames - 1)).toFixed(SVG_PRECISION));
            if (tE <= tS)
                continue;
            const kt = `0;${tS};${tS};${tE};1`;
            const opVals = `0;0;1;0;0`;
            for (const { x, y } of pop.cells) {
                const cx = toSvgCx(x).toFixed(1);
                const cy = toSvgCy(y).toFixed(1);
                // Expanding ring
                svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="none" stroke="${pop.color}" stroke-width="2" opacity="0">
					<animate attributeName="r"            calcMode="linear" dur="${dur}" repeatCount="indefinite" keyTimes="${kt}" values="4;4;4;${_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE};${_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE}"/>
					<animate attributeName="stroke-width" calcMode="linear" dur="${dur}" repeatCount="indefinite" keyTimes="${kt}" values="2;2;2;0;0"/>
					<animate attributeName="opacity"      calcMode="linear" dur="${dur}" repeatCount="indefinite" keyTimes="${kt}" values="${opVals}"/>
				</circle>`;
            }
        }
    }
    // ── Cannon ────────────────────────────────────────────────────────────
    if (totalFrames >= 2) {
        const gridBottomY = _core_constants__WEBPACK_IMPORTED_MODULE_1__.GRID_HEIGHT * (_core_constants__WEBPACK_IMPORTED_MODULE_1__.CELL_SIZE + _core_constants__WEBPACK_IMPORTED_MODULE_1__.GAP_SIZE) + 15;
        const cannonCx = (svgWidth / 2).toFixed(1);
        const cannonCy = (gridBottomY + 30).toFixed(1);
        // Barrel: a line rotated by cannon angle
        // Collect angle keyTimes/values
        const cannonTrack = { keyTimes: [], values: [] };
        for (let f = 0; f < store.gameHistory.length; f++) {
            const ti = t(f, totalFrames);
            const angleDeg = store.gameHistory[f].cannon.angleDeg;
            // SVG rotation: 0° = right, so we rotate from 90°-angleDeg
            const svgRot = (90 - angleDeg).toFixed(1);
            trackPush(cannonTrack, ti, `${svgRot} ${cannonCx} ${cannonCy}`);
        }
        const cannonAnim = finishTrack(cannonTrack);
        const barrelLen = 22;
        const bx2 = Number(cannonCx);
        const by1 = Number(cannonCy);
        const by2 = by1 - barrelLen;
        // Base circle — fill animates to match current bubble color
        const baseColorTrack = { keyTimes: [], values: [] };
        for (let f = 0; f < store.gameHistory.length; f++) {
            const ti = t(f, totalFrames);
            const ci = store.gameHistory[f].currentBubbleColorIndex;
            trackPush(baseColorTrack, ti, ((_b = _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_COLORS[ci]) !== null && _b !== void 0 ? _b : _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_COLORS[0]));
        }
        const baseColorAnim = finishTrack(baseColorTrack);
        const baseInitColor = ((_e = _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_COLORS[(_d = (_c = store.gameHistory[0]) === null || _c === void 0 ? void 0 : _c.currentBubbleColorIndex) !== null && _d !== void 0 ? _d : 0]) !== null && _e !== void 0 ? _e : _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_COLORS[0]);
        svg += `<circle cx="${cannonCx}" cy="${cannonCy}" r="10" fill="${baseInitColor}" stroke="white" stroke-width="2">
			<animate attributeName="fill" calcMode="discrete" dur="${dur}" repeatCount="indefinite"
				values="${baseColorAnim.values}" keyTimes="${baseColorAnim.keyTimes}"/>
			<animateTransform attributeName="transform" type="rotate" calcMode="linear"
				dur="${dur}" repeatCount="indefinite"
				keyTimes="${cannonAnim.keyTimes}" values="${cannonAnim.values}"/>
		</circle>`;
        // Barrel (rotates with linear interpolation so the sweep is visible)
        svg += `<line x1="${bx2}" y1="${by1}" x2="${bx2}" y2="${by2}" stroke="#cccccc" stroke-width="6" stroke-linecap="round">
			<animateTransform attributeName="transform" type="rotate" calcMode="linear"
				dur="${dur}" repeatCount="indefinite"
				keyTimes="${cannonAnim.keyTimes}" values="${cannonAnim.values}"/>
		</line>`;
        // ── Next bubble indicator ────────────────────────────────────────
        const nextTrack = { keyTimes: [], values: [] };
        for (let f = 0; f < store.gameHistory.length; f++) {
            const ti = t(f, totalFrames);
            const nci = store.gameHistory[f].nextBubbleColorIndex;
            trackPush(nextTrack, ti, ((_f = _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_COLORS[nci]) !== null && _f !== void 0 ? _f : _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_COLORS[0]));
        }
        const nextAnim = finishTrack(nextTrack);
        const nextCx = (Number(cannonCx) + 28).toFixed(1);
        const nextCy = cannonCy;
        const nextInitColor = ((_j = _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_COLORS[(_h = (_g = store.gameHistory[0]) === null || _g === void 0 ? void 0 : _g.nextBubbleColorIndex) !== null && _h !== void 0 ? _h : 0]) !== null && _j !== void 0 ? _j : _core_constants__WEBPACK_IMPORTED_MODULE_1__.PB_COLORS[0]);
        svg += `<text x="${nextCx}" y="${(Number(cannonCy) - 16).toFixed(1)}" text-anchor="middle" font-size="8" fill="${theme.textColor}" opacity="0.8">NEXT</text>`;
        svg += `<circle cx="${nextCx}" cy="${nextCy}" r="${_core_constants__WEBPACK_IMPORTED_MODULE_1__.BUBBLE_RADIUS}" fill="${nextInitColor}" stroke="white" stroke-width="1" stroke-opacity="0.5">
			<animate attributeName="fill" calcMode="discrete" dur="${dur}" repeatCount="indefinite"
				values="${nextAnim.values}" keyTimes="${nextAnim.keyTimes}"/>
		</circle>`;
    }
    svg += '</svg>';
    return svg;
};
const PuzzleBobblesVG = { generateAnimatedSVG };


/***/ },

/***/ "./src/shared/arcade-renderer.ts"
/*!***************************************!*\
  !*** ./src/shared/arcade-renderer.ts ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ARCADE_GAMES: () => (/* binding */ ARCADE_GAMES),
/* harmony export */   ArcadeRenderer: () => (/* binding */ ArcadeRenderer),
/* harmony export */   GAME_REGISTRY: () => (/* binding */ GAME_REGISTRY),
/* harmony export */   PlayerStyle: () => (/* reexport safe */ _pacman_index__WEBPACK_IMPORTED_MODULE_3__.PlayerStyle)
/* harmony export */ });
/* harmony import */ var _bomberman_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../bomberman/index */ "./src/bomberman/index.ts");
/* harmony import */ var _breakout_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../breakout/index */ "./src/breakout/index.ts");
/* harmony import */ var _galaga_index__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../galaga/index */ "./src/galaga/index.ts");
/* harmony import */ var _pacman_index__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../pacman/index */ "./src/pacman/index.ts");
/* harmony import */ var _puzzle_bobble_index__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../puzzle-bobble/index */ "./src/puzzle-bobble/index.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};






const gameRegistry = {
    pacman: {
        label: '👻 Pac-Man',
        factory: (conf) => new _pacman_index__WEBPACK_IMPORTED_MODULE_3__.PacmanRenderer(conf)
    },
    breakout: {
        label: '🧱 Breakout',
        factory: (conf) => new _breakout_index__WEBPACK_IMPORTED_MODULE_1__.BreakoutRenderer(conf)
    },
    galaga: {
        label: '🚀 Galaga',
        factory: (conf) => new _galaga_index__WEBPACK_IMPORTED_MODULE_2__.GalagaRenderer(conf)
    },
    'puzzle-bobble': {
        label: '🫧 Puzzle Bobble',
        factory: (conf) => new _puzzle_bobble_index__WEBPACK_IMPORTED_MODULE_4__.PuzzleBobbleRenderer(conf)
    },
    bomberman: {
        label: '💣 Bomberman',
        factory: (conf) => new _bomberman_index__WEBPACK_IMPORTED_MODULE_0__.BombermanRenderer(conf)
    }
};
const GAME_REGISTRY = gameRegistry;
const ARCADE_GAMES = Object.keys(GAME_REGISTRY);
class ArcadeRenderer {
    constructor(conf) {
        const entry = GAME_REGISTRY[conf.game];
        if (!entry) {
            throw new Error(`Unknown game "${conf.game}". Valid games: ${ARCADE_GAMES.join(', ')}`);
        }
        this.renderer = entry.factory(conf);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.renderer.start();
        });
    }
    stop() {
        this.renderer.stop();
    }
}


/***/ },

/***/ "./src/shared/constants.ts"
/*!*********************************!*\
  !*** ./src/shared/constants.ts ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CELL_SIZE: () => (/* binding */ CELL_SIZE),
/* harmony export */   DELTA_TIME: () => (/* binding */ DELTA_TIME),
/* harmony export */   GAME_THEMES: () => (/* binding */ GAME_THEMES),
/* harmony export */   GAP_SIZE: () => (/* binding */ GAP_SIZE),
/* harmony export */   GRID_HEIGHT: () => (/* binding */ GRID_HEIGHT),
/* harmony export */   GRID_WIDTH: () => (/* binding */ GRID_WIDTH),
/* harmony export */   MONTHS: () => (/* binding */ MONTHS)
/* harmony export */ });
/* ───────────── Grid dimensions ───────────── */
const CELL_SIZE = 20;
const GAP_SIZE = 2;
const GRID_WIDTH = 53; // 52 weeks + current week
const GRID_HEIGHT = 7; // Sun … Sat
const DELTA_TIME = 200;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/* ───────────── Official GitHub / GitLab Palettes ─────────────
   5-color array: 0 = NONE … 4 = FOURTH_QUARTILE               */
const GITHUB_LIGHT = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
const GITHUB_DARK = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const GITLAB_LIGHT = ['#ececef', '#d2dcff', '#7992f5', '#4e65cd', '#303470'];
const GITLAB_DARK = ['#2a2a3d', '#4a5bdc', '#2e3dbf', '#1b2e8a', '#0f1a4e'];
/* ───────────── Game Themes ───────────── */
const GAME_THEMES = {
    github: {
        textColor: '#57606a',
        gridBackground: '#ffffff',
        wallColor: '#000000',
        intensityColors: GITHUB_LIGHT
    },
    'github-dark': {
        textColor: '#8b949e',
        gridBackground: '#0d1117',
        wallColor: '#ffffff',
        intensityColors: GITHUB_DARK
    },
    gitlab: {
        textColor: '#626167',
        gridBackground: '#ffffff',
        wallColor: '#000000',
        intensityColors: GITLAB_LIGHT
    },
    'gitlab-dark': {
        textColor: '#999999',
        gridBackground: '#1f1f1f',
        wallColor: '#ffffff',
        intensityColors: GITLAB_DARK
    }
};


/***/ },

/***/ "./src/shared/providers/github-contributions.ts"
/*!******************************************************!*\
  !*** ./src/shared/providers/github-contributions.ts ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchGithubContributions: () => (/* binding */ fetchGithubContributions)
/* harmony export */ });
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/utils */ "./src/shared/utils/utils.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const fetchGithubContributions = (store) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ((_a = store.config.githubSettings) === null || _a === void 0 ? void 0 : _a.accessToken) {
        return yield fetchGithubContributionsGraphQL(store);
    }
    else {
        return yield fetchGithubContributionsRest(store);
    }
});
const fetchGithubContributionsRest = (store) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const commits = [];
    let isComplete = false;
    let page = 1;
    do {
        try {
            const headers = {};
            if ((_b = store.config.githubSettings) === null || _b === void 0 ? void 0 : _b.accessToken) {
                headers['Authorization'] = 'Bearer ' + store.config.githubSettings.accessToken;
            }
            const response = yield fetch(`https://api.github.com/search/commits?q=author:${store.config.username}&sort=author-date&order=desc&page=${page}&per_page=100`, { headers });
            const data = yield response.json();
            isComplete = !data.items || data.items.length === 0;
            commits.push(...((_c = data.items) !== null && _c !== void 0 ? _c : []));
            page++;
        }
        catch (_d) {
            isComplete = true;
        }
    } while (!isComplete);
    const contributions = Array.from(commits
        .reduce((map, item) => {
        var _a, _b, _c, _d;
        const authorDateStr = (_b = (_a = item.commit.author) === null || _a === void 0 ? void 0 : _a.date) === null || _b === void 0 ? void 0 : _b.split('T')[0];
        const committerDateStr = (_d = (_c = item.commit.committer) === null || _c === void 0 ? void 0 : _c.date) === null || _d === void 0 ? void 0 : _d.split('T')[0];
        const keyDate = committerDateStr || authorDateStr;
        const count = (map.get(keyDate) || { count: 0 }).count + 1;
        return map.set(keyDate, {
            date: new Date(keyDate),
            count,
            color: '',
            level: 'NONE'
        });
    }, new Map())
        .values());
    const maxCount = Math.max(...contributions.map((el) => el.count).filter((c) => c > 0));
    return contributions.map((c) => {
        const level = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.calculateContributionLevel)(c.count, maxCount);
        const theme = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getCurrentTheme)(store);
        return {
            date: new Date(c.date),
            count: c.count,
            color: theme.intensityColors[(0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.levelToIndex)(level)],
            level
        };
    });
});
const fetchGithubContributionsGraphQL = (store) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const query = /* GraphQL */ `
		query ($login: String!) {
			user(login: $login) {
				contributionsCollection {
					contributionCalendar {
						weeks {
							contributionDays {
								date
								contributionCount
								color
								contributionLevel
							}
						}
					}
				}
			}
		}
	`;
    const response = yield fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${(_e = store.config.githubSettings) === null || _e === void 0 ? void 0 : _e.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables: { login: store.config.username } })
    });
    if (!response.ok) {
        throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`);
    }
    const json = (yield response.json());
    return json.data.user.contributionsCollection.contributionCalendar.weeks
        .map((week) => week.contributionDays)
        .reduce((acc, days) => acc.concat(days), [])
        .map((d) => {
        const level = d.contributionLevel;
        const theme = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getCurrentTheme)(store);
        return {
            date: new Date(d.date),
            count: d.contributionCount,
            color: theme.intensityColors[(0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.levelToIndex)(level)],
            level
        };
    });
});


/***/ },

/***/ "./src/shared/providers/gitlab-contributions.ts"
/*!******************************************************!*\
  !*** ./src/shared/providers/gitlab-contributions.ts ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchGitlabContributions: () => (/* binding */ fetchGitlabContributions)
/* harmony export */ });
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/utils */ "./src/shared/utils/utils.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const fetchGitlabContributions = (store) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(`https://v0-new-project-q1hhrdodoye-abozanona-gmailcoms-projects.vercel.app/api/contributions?username=${store.config.username}`);
    const contributionsList = yield response.json();
    const contributions = Object.entries(contributionsList).map(([date, count]) => ({
        date: new Date(date),
        count: Number(count),
        color: '',
        level: 'NONE'
    }));
    const maxCount = Math.max(...contributions.map((el) => el.count).filter((c) => c > 0));
    return contributions.map((c) => {
        const level = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.calculateContributionLevel)(c.count, maxCount);
        const theme = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getCurrentTheme)(store);
        return {
            date: new Date(c.date),
            count: c.count,
            color: theme.intensityColors[(0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.levelToIndex)(level)],
            level
        };
    });
});


/***/ },

/***/ "./src/shared/providers/providers.ts"
/*!*******************************************!*\
  !*** ./src/shared/providers/providers.ts ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Providers: () => (/* binding */ Providers)
/* harmony export */ });
/* harmony import */ var _github_contributions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./github-contributions */ "./src/shared/providers/github-contributions.ts");
/* harmony import */ var _gitlab_contributions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gitlab-contributions */ "./src/shared/providers/gitlab-contributions.ts");


const Providers = {
    fetchGithubContributions: _github_contributions__WEBPACK_IMPORTED_MODULE_0__.fetchGithubContributions,
    fetchGitlabContributions: _gitlab_contributions__WEBPACK_IMPORTED_MODULE_1__.fetchGitlabContributions
};


/***/ },

/***/ "./src/shared/utils/utils.ts"
/*!***********************************!*\
  !*** ./src/shared/utils/utils.ts ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Utils: () => (/* binding */ Utils),
/* harmony export */   buildGrid: () => (/* binding */ buildGrid),
/* harmony export */   buildMonthLabels: () => (/* binding */ buildMonthLabels),
/* harmony export */   calculateContributionLevel: () => (/* binding */ calculateContributionLevel),
/* harmony export */   createGridFromData: () => (/* binding */ createGridFromData),
/* harmony export */   getCurrentTheme: () => (/* binding */ getCurrentTheme),
/* harmony export */   levelToIndex: () => (/* binding */ levelToIndex)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "./src/shared/constants.ts");

/* ─────────────────────────── Helpers ─────────────────────────── */
const weeksBetween = (start, end) => Math.floor((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
const truncateToUTCDate = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
/* ───────────────────────── Theme helpers ────────────────────── */
const getCurrentTheme = (store) => { var _a; return (_a = _constants__WEBPACK_IMPORTED_MODULE_0__.GAME_THEMES[store.config.gameTheme]) !== null && _a !== void 0 ? _a : _constants__WEBPACK_IMPORTED_MODULE_0__.GAME_THEMES['github']; };
const levelToIndex = (level) => {
    switch (level) {
        case 'NONE':
            return 0;
        case 'FIRST_QUARTILE':
            return 1;
        case 'SECOND_QUARTILE':
            return 2;
        case 'THIRD_QUARTILE':
            return 3;
        case 'FOURTH_QUARTILE':
            return 4;
        default:
            return 0;
    }
};
const calculateContributionLevel = (contribution, maxContribution) => {
    const q = maxContribution / 4;
    if (contribution === 0)
        return 'NONE';
    if (contribution < q)
        return 'FIRST_QUARTILE';
    if (contribution < 2 * q)
        return 'SECOND_QUARTILE';
    if (contribution < 3 * q)
        return 'THIRD_QUARTILE';
    return 'FOURTH_QUARTILE';
};
const buildGrid = (store) => {
    const endDate = truncateToUTCDate(new Date());
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - 365);
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());
    const realWidth = 53;
    const grid = Array.from({ length: realWidth }, () => Array.from({ length: _constants__WEBPACK_IMPORTED_MODULE_0__.GRID_HEIGHT }, () => ({
        commitsCount: 0,
        color: getCurrentTheme(store).intensityColors[0],
        level: 'NONE'
    })));
    store.contributions.forEach((c) => {
        const date = truncateToUTCDate(new Date(c.date));
        if (date < startDate || date > endDate)
            return;
        const day = date.getUTCDay();
        const week = weeksBetween(startDate, date);
        if (week >= 0 && week < realWidth) {
            const theme = getCurrentTheme(store);
            grid[week][day] = {
                commitsCount: c.count,
                color: theme.intensityColors[levelToIndex(c.level)],
                level: c.level
            };
        }
    });
    store.grid = grid;
};
const buildMonthLabels = (store) => {
    const endDate = truncateToUTCDate(new Date());
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - 365);
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());
    const realWidth = weeksBetween(startDate, endDate) + 1;
    const labels = Array(realWidth).fill('');
    let lastMonth = '';
    for (let week = 0; week < realWidth; week++) {
        const date = new Date(startDate);
        date.setUTCDate(date.getUTCDate() + week * 7);
        const currentMonth = date.toLocaleString('default', { month: 'short' });
        if (currentMonth !== lastMonth) {
            labels[week] = currentMonth;
            lastMonth = currentMonth;
        }
    }
    store.monthLabels = realWidth > _constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH ? labels.slice(realWidth - _constants__WEBPACK_IMPORTED_MODULE_0__.GRID_WIDTH) : labels;
};
const createGridFromData = (store) => {
    buildGrid(store);
    return store.grid;
};
const Utils = {
    getCurrentTheme,
    buildGrid,
    buildMonthLabels,
    createGridFromData,
    levelToIndex
};


/***/ }

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	if (!(moduleId in __webpack_modules__)) {
/******/ 		delete __webpack_module_cache__[moduleId];
/******/ 		var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 		e.code = 'MODULE_NOT_FOUND';
/******/ 		throw e;
/******/ 	}
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ARCADE_GAMES: () => (/* reexport safe */ _shared_arcade_renderer__WEBPACK_IMPORTED_MODULE_5__.ARCADE_GAMES),
/* harmony export */   ArcadeRenderer: () => (/* reexport safe */ _shared_arcade_renderer__WEBPACK_IMPORTED_MODULE_5__.ArcadeRenderer),
/* harmony export */   BombermanRenderer: () => (/* reexport safe */ _bomberman_index__WEBPACK_IMPORTED_MODULE_0__.BombermanRenderer),
/* harmony export */   BreakoutRenderer: () => (/* reexport safe */ _breakout_index__WEBPACK_IMPORTED_MODULE_1__.BreakoutRenderer),
/* harmony export */   GAME_REGISTRY: () => (/* reexport safe */ _shared_arcade_renderer__WEBPACK_IMPORTED_MODULE_5__.GAME_REGISTRY),
/* harmony export */   GalagaRenderer: () => (/* reexport safe */ _galaga_index__WEBPACK_IMPORTED_MODULE_2__.GalagaRenderer),
/* harmony export */   PacmanRenderer: () => (/* reexport safe */ _pacman_index__WEBPACK_IMPORTED_MODULE_3__.PacmanRenderer),
/* harmony export */   PlayerStyle: () => (/* reexport safe */ _pacman_index__WEBPACK_IMPORTED_MODULE_3__.PlayerStyle),
/* harmony export */   PuzzleBobbleRenderer: () => (/* reexport safe */ _puzzle_bobble_index__WEBPACK_IMPORTED_MODULE_4__.PuzzleBobbleRenderer)
/* harmony export */ });
/* harmony import */ var _bomberman_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bomberman/index */ "./src/bomberman/index.ts");
/* harmony import */ var _breakout_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./breakout/index */ "./src/breakout/index.ts");
/* harmony import */ var _galaga_index__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./galaga/index */ "./src/galaga/index.ts");
/* harmony import */ var _pacman_index__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pacman/index */ "./src/pacman/index.ts");
/* harmony import */ var _puzzle_bobble_index__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./puzzle-bobble/index */ "./src/puzzle-bobble/index.ts");
/* harmony import */ var _shared_arcade_renderer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./shared/arcade-renderer */ "./src/shared/arcade-renderer.ts");







})();

const __webpack_exports__ARCADE_GAMES = __webpack_exports__.ARCADE_GAMES;
const __webpack_exports__ArcadeRenderer = __webpack_exports__.ArcadeRenderer;
const __webpack_exports__BombermanRenderer = __webpack_exports__.BombermanRenderer;
const __webpack_exports__BreakoutRenderer = __webpack_exports__.BreakoutRenderer;
const __webpack_exports__GAME_REGISTRY = __webpack_exports__.GAME_REGISTRY;
const __webpack_exports__GalagaRenderer = __webpack_exports__.GalagaRenderer;
const __webpack_exports__PacmanRenderer = __webpack_exports__.PacmanRenderer;
const __webpack_exports__PlayerStyle = __webpack_exports__.PlayerStyle;
const __webpack_exports__PuzzleBobbleRenderer = __webpack_exports__.PuzzleBobbleRenderer;
export { __webpack_exports__ARCADE_GAMES as ARCADE_GAMES, __webpack_exports__ArcadeRenderer as ArcadeRenderer, __webpack_exports__BombermanRenderer as BombermanRenderer, __webpack_exports__BreakoutRenderer as BreakoutRenderer, __webpack_exports__GAME_REGISTRY as GAME_REGISTRY, __webpack_exports__GalagaRenderer as GalagaRenderer, __webpack_exports__PacmanRenderer as PacmanRenderer, __webpack_exports__PlayerStyle as PlayerStyle, __webpack_exports__PuzzleBobbleRenderer as PuzzleBobbleRenderer };

//# sourceMappingURL=pacman-contribution-graph.js.map