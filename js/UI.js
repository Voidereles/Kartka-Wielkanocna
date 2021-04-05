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


const rankingButton = document.getElementById('rankingButton');
const ranking = document.getElementById('ranking');


const backMenuButtons = document.querySelectorAll('.backMenuButton');
const mainMenu = document.getElementById('mainMenu');


const inviteFriendButtons = document.querySelectorAll('.inviteFriendButton');
const inviteFriend = document.getElementById('inviteFriend');


//IMS - Interface Management System
function IMS(elemToListen, elemToHide) {
    elemToListen.addEventListener('click', () => {
        hideContainers();
        elemToHide.classList.remove('transparent');
    });
}

IMS(regulationsButton, regulations);
IMS(privacyPolicyButton, privacyPolicy);
IMS(rulesButton, rules);
IMS(rankingButton, ranking);



backMenuButtons.forEach(element => {
    element.addEventListener('click', () => {
        hideContainers();
        mainMenu.classList.remove('transparent');
    })
});



inviteFriendButtons.forEach(element => {
    element.addEventListener('click', () => {
        hideContainers();
        inviteFriend.classList.remove('transparent');
    })
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