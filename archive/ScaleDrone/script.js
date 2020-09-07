//create error to call for too many users
class Error {
    constructor(message) {
        this.message = message;
        this.name = "Error";
    }
}

//room variables
let onlineUsers = [];
let members = [];
const thisUser = {
    data: {
        name: getRandomName(),
        color: getRandomColor(),
    },
};
const CHANNEL_ID = 'w8iSBcHGqQJ9e4JC';
const drone = new ScaleDrone(CHANNEL_ID, thisUser);



//create a unique name for every new users up to 20
function getRandomName() {

    if (onlineUsers.length < 21){

        const adjs = ["excitable", "conscious", "tedious", "terrific", "omniscient", "fluffy", "lucky", "puzzled", "sable", "nice", "famous", "dusty", "cheerful", "adamant", "bashful", "muddled", "absurd", "defiant", "tidy", "fantastic"];

        const nouns = ["agouti", "bison", "condor", "dove", "emu", "frog", "guanaco", "hyena", "ibex", "koala", "lion", "meerkat", "otter", "peccary", "quail", "ringtail", "sloth", "tortoise", "urial", "vulture", "woylie", "yak", "zorilla"];

        let name = adjs[Math.floor(Math.random() * adjs.length)] + "-" + nouns[Math.floor(Math.random() * nouns.length)];
        if (onlineUsers.indexOf(name) === -1) {
            onlineUsers.push(name);
            return name
        } else {
            getRandomName();
        }
    } else {
        throw new Error("Sorry, the room is already full!")
    }
}


//create a random color for each new user
function getRandomColor(){
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

//connect to room

drone.on('open', error => {
    if (error) {
        return console.error(error);
    }
    console.log('Successfully connected to Scaledrone');

    let room = drone.subscribe('observable-room');
    room.on('open', error => {
        if (error){
            return console.error(error);
        }
        console.log(('Successfully joined room'));
    })

    //List of currently online members, emitted once
    room.on('members', m=> {
        members = m;
        updateMembersDOM();
    });

    //User joined the room
    room.on('member_join', member => {
        members.push(member);
        updateMembersDOM();
    });

    //User Left the room
    room.on('member_leave', ({id}) => {
        const index = members.findIndex(member => member.id === id);
        members.splice(index, 1);
        updateMembersDOM();
    });

    room.on('data', (text, member) => {
        if(member){
            addMessageToListDOM(text, member);
        } else {
            //Message is from server
        }
    });

})





const DOM = {
    membersCount: document.querySelector('.members-count'),
    membersList: document.querySelector('.members-list'),
    messages: document.querySelector('.messages'),
    input: document.querySelector('.message-form__input'),
    form: document.querySelector('.message-form'),
};

function createMemberElement(member){
    const { name, color } = member.clientData;
    const el = document.createElement('div');
    el.appendChild(document.createTextNode(name));
    el.className='member';
    el.style.color = color;
    return el;
}

function updateMembersDOM() {
    DOM.membersCount.innerText = `${members.length} users in room:`;
    DOM.membersList.innerHTML = '';
    members.forEach(member =>
        DOM.membersList.appendChild(createMemberElement(member))
        );
}

function createMessageElement(text, member) {
    const el = document.createElement('div');
    el.appendChild(createMemberElement(member));
    el.appendChild(document.createTextNode(text));
    el.className = 'message';
    return el;
}

function addMessageToListDOM(text, member){
    const el = DOM.messages;
    el.appendChild(createMessageElement(text, member));
    el.scrollTop = el.scrollHeight;
}

DOM.form.addEventListener('submit', sendMessage);

function sendMessage() {
    const value = DOM.input.value;
    if (value === '') {
        return;
    }
    DOM.input.value = '';
    drone.publish({
        room: 'observable-room',
        message: value,
    });
    if (DOM.input.value==='n'){
        room = drone.subscribe('observable-room-n')
    }
}