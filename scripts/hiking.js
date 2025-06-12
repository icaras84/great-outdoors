class HikingTrailItem extends GO_PostContent{
    locationLink;


    constructor(title, timestamp, content, locationLink) {
        super(title, timestamp, content);
        this.locationLink = locationLink;
    }

    toJson() {
        return JSON.stringify(this);
    }


    toHTML(parentId, idx) {
        let output = super.toHTML(parentId, idx);

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

class HikingTrailBuilder extends GO_PostBuilder{
    fromJsonObject(jsonObject) {
        return new HikingTrailItem(jsonObject.title, jsonObject.timestamp, jsonObject.content, jsonObject.link);
    }
}

let hikingTrailBuilder = new HikingTrailBuilder();
let hikingSys = new GO_PostSystem(hikingTrailBuilder, "hiking-feed", "hikingLocations");

// debug function to load a JSON file of announcements by fetch request
function debugTestHikingTrails(idx){
    fetch(`./json/hiking/test/hikingTest${idx}.json`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            hikingSys.loadFromJson(data);
            hikingSys.refreshPostsOntoHTML();
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
}
window.GO_HeaderLoaded.pushSubscribers([
    () => {
        let searchForm = document.getElementById('searchForm');
        let searchbar = document.getElementById('searchbar');
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();

            let searchIn = searchbar.value;
            let searchQuery = new GO_SearchQuery();
            searchQuery.titleRegex = new RegExp(searchIn, 'g');
            searchQuery.contentRegex = new RegExp(searchIn, 'g');

            hikingSys.searchQuery = searchQuery;
            hikingSys.refreshPostsOntoHTML();
        })
    }
]);