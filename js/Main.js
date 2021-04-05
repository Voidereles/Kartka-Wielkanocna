import {
    Game
} from './Game';
import './UI';

const canvas = document.getElementsByClassName("three-canvas")[0];
const menu = document.getElementsByClassName('menu')[0];
const gameOverScoreDiv = document.getElementsByClassName('game-over-score')[0];

const gameOverDiv = document.getElementById('gameOver');
const startButtons = document.querySelectorAll('.start');
const scoreDiv = document.getElementsByClassName('score')[0];

init();

function init() {

    const game = new Game(canvas);

    startButtons.forEach(element => {
        element.addEventListener('click', () => {
            game.start();
            menu.style.display = 'none';
            scoreDiv.textContent = '0 punktów';
            document.querySelectorAll('.container').forEach(element => {
                element.classList.add('transparent');
            });
            if (scoreDiv.classList.contains('transparent')) {
                scoreDiv.classList.remove('transparent');
            }
        }, false);
    });


    document.addEventListener('Game Over', () => {
        game.stop();
        menu.style.display = 'inline-block';
        gameOverScoreDiv.textContent = game.getScore();
        gameOverDiv.classList.remove('transparent');
        scoreDiv.classList.add('transparent');
    }, false);
}