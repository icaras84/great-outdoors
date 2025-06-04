class Announcement extends GO_PostContent{}
class AnnouncementBuilder extends GO_PostBuilder{
    fromJsonObject(jsonObject) {
        return new Announcement(jsonObject.title, jsonObject.timestamp, jsonObject.content);
    }
}

class News extends GO_PostContent{}
class NewsBuilder extends GO_PostBuilder{
    fromJsonObject(jsonObject) {
        return new News(jsonObject.title, jsonObject.timestamp, jsonObject.content);
    }
}


let announcementBuilder = new AnnouncementBuilder();
let announcementSys = new GO_PostSystem(announcementBuilder, "announcement-feed", "announcementList");

let newsBuilder = new NewsBuilder();
let newsSys = new GO_PostSystem(newsBuilder, "news-feed", "newsList");

// debug function to load a JSON file of announcements by fetch request
function debugTestAnnouncements(idx){
    fetch(`./json/announcements/test/announcementTest${idx}.json`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            announcementSys.loadFromJson(data);
            newsSys.loadFromJson(data);

            announcementSys.refreshPostsOntoHTML();
            newsSys.refreshPostsOntoHTML();
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
}