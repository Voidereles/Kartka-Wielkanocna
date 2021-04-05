import {
    Game
} from './Game';
import './UI';

const canvas = document.getElementsByClassName("three-canvas")[0];
const gameOverScoreDiv = document.getElementsByClassName('game-over-score')[0];

const gameOverDiv = document.getElementById('gameOver');
const startButtons = document.querySelectorAll('.start');
const scoreDiv = document.getElementsByClassName('score')[0];

const footer = document.getElementById('footer');


init();

function init() {

    const game = new Game(canvas);

    const hideContainers = () => {
        document.querySelectorAll('.container').forEach(element => {
            element.classList.add('transparent');
        });
    }

    startButtons.forEach(element => {
        element.addEventListener('click', () => {
            game.start();
            scoreDiv.textContent = '0 punktów';
            hideContainers();
            if (scoreDiv.classList.contains('transparent')) {
                scoreDiv.classList.remove('transparent');
            }
            footer.classList.add('transparent');
        }, false);
    });


    document.addEventListener('Game Over', () => {
        game.stop();
        gameOverScoreDiv.textContent = game.getScore();
        gameOverDiv.classList.remove('transparent');
        scoreDiv.classList.add('transparent');
        footer.classList.remove('transparent');
    }, false);


}