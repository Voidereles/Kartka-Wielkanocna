const hideContainers = () => {
    document.querySelectorAll('.container').forEach(element => {
        element.classList.add('transparent');
    });
}



const regulationsButton = document.getElementById('regulationsButton');
const regulations = document.getElementById('regulations');


const privacyPolicyButton = document.getElementById('privacyPolicyButton');
const privacyPolicy = document.getElementById('privacyPolicy');


const rulesButton = document.getElementById('rulesButton');
const rules = document.getElementById('rules');


const rankingButtons = document.querySelectorAll('.ranking-button');
const ranking = document.getElementById('ranking');


const backMenuButtons = document.querySelectorAll('.backMenuButton');
const mainMenu = document.getElementById('mainMenu');


const inviteFriendButtons = document.querySelectorAll('.invite-friend-button');
const inviteFriend = document.getElementById('inviteFriend');


//IMS - Interface Management System
function IMS(elemToListen, elemToShow) {
    elemToListen.addEventListener('click', () => {
        hideContainers();
        elemToShow.classList.remove('transparent');
    });
}

IMS(regulationsButton, regulations);
IMS(privacyPolicyButton, privacyPolicy);
IMS(rulesButton, rules);
// IMS(rankingButton, ranking);


backMenuButtons.forEach(element => {
    IMS(element, mainMenu);
});

inviteFriendButtons.forEach(element => {
    IMS(element, inviteFriend);
});


rankingButtons.forEach(element => {
    IMS(element, ranking);
});




document.querySelectorAll('input').forEach(element => {
    element.addEventListener('focus', () => {
        element.parentElement.classList.add('focused');
    })
});

let inputValue;
document.querySelectorAll('input').forEach(element => {
    element.addEventListener('focusout', () => {
        inputValue = element.value;
        if (inputValue == "") {
            element.parentElement.classList.remove('focused');
        }
    })
});