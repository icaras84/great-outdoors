// class to store basic announcement information
class Announcement {
    title; // title of the announcement
    timestamp; // timestamp of the announcement
    content; // content of the announcement

    // constructor to fully construct the announcement
    constructor(title, timestamp, content) {
        this.title = title;
        this.timestamp = timestamp;
        this.content = content;
    }

    // makes this object a JSON string
    toJson(){
        return JSON.stringify(this);
    }

    // parses into an announcement from a JSON string
    static fromJsonStr(jsonStr){
        return Announcement.fromJsonObj(JSON.parse(jsonStr));
    }

    // parses into an announcement from a JsonObject
    static fromJsonObj(jsonObj){
        return new Announcement(jsonObj.title, jsonObj.timestamp, jsonObj.content);
    }

    // formats the content into a valid HTML structure
    toHTML(){
        let titleHeader = "<strong>" + this.title + "</strong><br>";
        let timestampHeader = "<em>" + this.timestamp + "</em><br>";
        let contentHeader = this.content;

        return "<li class='announcement-item'>" + titleHeader + timestampHeader + contentHeader + "</li>";
    }
}

// cached announcements (what should be displayed on the page)
let loadedAnnouncements = [];

// pushes an announcement onto what should be visible
function addAnnouncement(announcementObj) {
    loadedAnnouncements.push(announcementObj);
    refreshAnnouncements(loadedAnnouncements);
}

// removes an announcement shown based on a specific announcement
function removeAnnouncement(announcementObj) {
    let idx = loadedAnnouncements.indexOf(announcementObj);
    loadedAnnouncements.splice(idx, 1);
    refreshAnnouncements(loadedAnnouncements);
}

// takes in an announcement list and places all announcement HTMLs into the child of any element (tagged with the id of "announcement-feed")
function refreshAnnouncements(announcementList) {
    let announcementListDiv = document.getElementById("announcement-feed");
    announcementListDiv.innerHTML = '';
    announcementList.forEach(announcement => announcementListDiv.innerHTML += announcement.toHTML());
}

// loads the list of announcements based on a passed in JSON object
function loadAnnouncementJSONList(jsonObj) {
    loadedAnnouncements = [];
    jsonObj.announcementList.forEach(announcement => {
        loadedAnnouncements.push(Announcement.fromJsonObj(announcement));
    });

    // "reload" what is displayed in each element that is tagged with "announcement-feed"
    refreshAnnouncements(loadedAnnouncements);
}

// debug function to load a JSON file of announcements by fetch request
function debugTestAnnouncements(idx){
    fetch(`./json/announcements/test/announcementTest${idx}.json`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            loadAnnouncementJSONList(data);
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
}


