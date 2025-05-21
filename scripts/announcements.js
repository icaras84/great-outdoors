class Announcement {
    title;
    timestamp;
    content;

    constructor(title, timestamp, content) {
        this.title = title;
        this.timestamp = timestamp;
        this.content = content;
    }

    toJson(){
        return JSON.stringify(this);
    }

    static fromJsonStr(jsonStr){
        return Announcement.fromJsonObj(JSON.parse(jsonStr));
    }

    static fromJsonObj(jsonObj){
        return new Announcement(jsonObj.title, jsonObj.timestamp, jsonObj.content);
    }

    toHTML(){
        let titleHeader = "<strong>" + this.title + "</strong><br>";
        let timestampHeader = "<em>" + this.timestamp + "</em><br>";
        let contentHeader = this.content;

        return "<li>" + titleHeader + timestampHeader + contentHeader + "</li>";
    }
}

let loadedAnnouncements = [];

function addAnnouncement(announcementObj) {
    loadedAnnouncements.push(announcementObj);
    refreshAnnouncements(loadedAnnouncements);
}

function removeAnnouncement(announcementObj) {
    let idx = loadedAnnouncements.indexOf(announcementObj);
    loadedAnnouncements.splice(idx, 1);
    refreshAnnouncements(loadedAnnouncements);
}

function refreshAnnouncements(announcementList) {
    let announcementListDiv = document.getElementById("announcement-feed");
    announcementListDiv.innerHTML = '';
    announcementList.forEach(announcement => announcementListDiv.innerHTML += announcement.toHTML());
}

function loadAnnouncementJSONList(jsonObj) {
    loadedAnnouncements = [];
    jsonObj.announcementList.forEach(announcement => {
        loadedAnnouncements.push(Announcement.fromJsonObj(announcement));
    });
    refreshAnnouncements(loadedAnnouncements);
}

function debugTestAnnouncements1(){
    fetch(`./testJson/announcementTest1.json`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            loadAnnouncementJSONList(data);
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
}


