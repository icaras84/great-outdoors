
class EventPost extends GO_PostContent{
    locationLink;


    constructor(title, timestamp, content, locationLink) {
        super(title, timestamp, content);
        this.locationLink = locationLink;
    }

    toJson() {
        return JSON.stringify(this);
    }


    toHTML(parentId) {
        let output = super.toHTML(parentId);

        let destinationLinkSpacer = document.createElement("p");
        destinationLinkSpacer.className = output.className + "-spacer";
        destinationLinkSpacer.textContent = "Location: ";

        let destinationLinkText = document.createElement("a");
        destinationLinkText.textContent = this.locationLink;
        destinationLinkText.setAttribute("href", this.locationLink);

        destinationLinkSpacer.appendChild(destinationLinkText);
        output.appendChild(destinationLinkSpacer);

        return output;
    }
}

class EventPostBuilder extends GO_PostBuilder{
    fromJsonObject(jsonObject) {
        return new EventPost(jsonObject.title, jsonObject.timestamp, jsonObject.content, jsonObject.locationLink);
    }
}

let eventsBuilder = new EventPostBuilder();
let eventSys = new GO_PostSystem(eventsBuilder, "events-feed", "eventsList");

// debug function to load a JSON file of announcements by fetch request
function debugTestEventsPost(idx){
    fetch(`./json/events/test/eventTest${idx}.json`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            eventSys.loadFromJson(data);
            eventSys.refreshPostsOntoHTML();
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
}
