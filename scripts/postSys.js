// A class that contains what the post entails plus a method to create the HTML for it
class GO_PostContent {
    title;
    timestamp;
    content;

    constructor(title, timestamp, content) {
        this.title = title;
        this.timestamp = timestamp;
        this.content = content;
    }

    // makes this object a JSON string
    toJson(){
        return JSON.stringify(this);
    }

    // formats the content into a valid HTML structure
    toHTML(parentId){
        let output = document.createElement("div");
        output.className = parentId + "-item";


        let topElement = document.createElement("p");
        topElement.className = output.className + "-spacer";

        let middleElement = document.createElement("p");
        middleElement.className = output.className + "-spacer";

        let bottomElement = document.createElement("p");
        bottomElement.className = output.className + "-spacer";


        let titleElement = document.createElement("strong");
        titleElement.textContent = this.title;
        titleElement.className = output.className + "-title";

        let timestampElement = document.createElement("em");
        timestampElement.textContent = this.timestamp;
        timestampElement.className = output.className + "-timestamp";

        let contentElement = document.createElement("p");
        contentElement.textContent = this.content;
        contentElement.className = output.className + "-content";

        topElement.appendChild(titleElement);
        middleElement.appendChild(timestampElement);
        bottomElement.appendChild(contentElement);

        output.appendChild(topElement);
        output.appendChild(middleElement);
        output.appendChild(bottomElement);

        return output;
    }
}

class GO_PostBuilder {
    fromJsonObject(jsonObject) {
        return new GO_PostContent(jsonObject.title, jsonObject.timestamp, jsonObject.content);
    }

    fromJsonString(jsonString) {
        return this.fromJsonObject(JSON.parse(jsonString));
    }
}

class GO_PostModel {
    loadedPosts = []
    jsonArrayVarName = "";
    postBuilder = new GO_PostBuilder();

    constructor(postBuilder, loadedPosts, jsonArrayVarName) {
        this.postBuilder = postBuilder;
        this.loadedPosts = loadedPosts;
        this.jsonArrayVarName = jsonArrayVarName;
    }

    pushPost(post){
        this.loadedPosts.push(post);
    }

    removePost(post){
        this.loadedPosts = this.loadedPosts.filter(post => post.id !== post.id);
    }

    removePoseOnIndices(indices){
        this.loadedPosts.filter((post, idx) => !(idx in indices));
    }

    loadFromJson(jsonObj){
        this.loadedPosts = [];
        if (this.jsonArrayVarName in jsonObj) {
            jsonObj[this.jsonArrayVarName].forEach(childObj => {
                this.pushPost(this.postBuilder.fromJsonObject(childObj));
            });
        }
    }
}

class GO_PostView {
    htmlIDToLookup = "";

    constructor(htmlIDToLookup) {
        this.htmlIDToLookup = htmlIDToLookup;
    }

    pasteOntoHTML(posts){
        let postListHTMLParent = document.getElementById(this.htmlIDToLookup);
        postListHTMLParent.innerHTML = "";
        posts.forEach(post =>
            postListHTMLParent.appendChild(post.toHTML(this.htmlIDToLookup))
        );
    }
}

class SearchQuery {
    titleRegex = new RegExp('', 'g');
    timestampFilter = [new Date(), new Date()];
    contentRegex = new RegExp('', 'g');

    targetTitle = true;
    ascendingTitleScore = true;

    targetTimestamp = false;
    ascendingTimestampScore = true;

    targetContent = true;
    ascendingContentScore = true;

    constructor(regex) {
        this.titleRegex = regex;
    }

    scoringFunc(post){
        // get title matches based on regex
        let titleRegexResult = post.title.matchAll(this.titleRegex);

        // get content matches based on regex
        let contentRegexResult = post.content.matchAll(this.contentRegex);

        let titleScore = 0;
        let contentScore = 0;

        // count the length of title matches
        for (const titleMatch of titleRegexResult) {
            titleScore++;
        }

        // count the length of content matches
        for (const contentMatch of contentRegexResult) {
            contentScore++;
        }

        // boundary checking for time ranges
        let lowerTimestampScore = Date.parse(post.timestamp) - this.timestampFilter[0].getTime();
        let upperTimestampScore = this.timestampFilter[1].getTime() - Date.parse(post.timestamp);

        return [titleScore, contentScore, lowerTimestampScore, upperTimestampScore];
    }

    filterFunc(post){
        let scores = this.scoringFunc(post);
        let titleResult = this.targetTitle ? scores[0] > 0 : true;
        let contentResult = this.targetContent ? scores[1] > 0 : true;
        let timestampResult = this.targetTimestamp ? (scores[2] > 0 && scores[3] < 0) : true;
        return titleResult && contentResult && timestampResult;
    }

    compareFunc(postA, postB){
        let scoreA = this.scoringFunc(postA);
        let scoreB = this.scoringFunc(postB);

        let titleComparison = this.ascendingTitleScore ? scoreA[0] - scoreB[0] : scoreB[0] - scoreA[0];
        let contentComparison = this.ascendingContentScore ? scoreA[1] - scoreB[1] : scoreB[1] - scoreA[1];
        let timestampComparison = this.ascendingTimestampScore ? scoreA[2] - scoreB[2] : scoreB[2] - scoreA[2];

        return titleComparison + contentComparison + timestampComparison;
    }
}

class GO_PostSystem {
    postModel = new GO_PostModel();
    postBuilder = new GO_PostBuilder();
    postView = new GO_PostView();

    searchQuery = new SearchQuery();
    intermediatePosts = [];

    constructor(postBuilder, htmlIDToLookup, jsonArrayVarName){
        this.postBuilder = postBuilder;
        this.postView = new GO_PostView(htmlIDToLookup);
        this.postModel = new GO_PostModel(this.postBuilder, [], jsonArrayVarName);
        this.intermediatePosts = [];
    }

    pushPost(post){
        this.postModel.pushPost(post);
    }

    removePost(post){
        this.postModel.removePost(post);
    }

    removePoseOnIndices(indices){
        this.postModel.removePoseOnIndices(indices);
    }

    filterPosts(searchQuery){
        this.intermediatePosts = this.postModel.loadedPosts.filter(post => searchQuery.filterFunc(post));
        this.intermediatePosts.sort((a, b) => this.searchQuery.compareFunc(a, b));
    }

    refreshPostsOntoHTML(){
        this.filterPosts(this.searchQuery)
        this.postView.pasteOntoHTML(this.intermediatePosts);
    }

    loadFromJson(jsonObj){
        this.postModel.loadFromJson(jsonObj);
    }
}


//export {PostContent, PostBuilder, PostModel, PostView, PostSystem};
window.GO_PostContent = GO_PostContent;
window.GO_PostBuilder = GO_PostBuilder;

window.GO_PostView = GO_PostView;
window.GO_PostModel = GO_PostModel;
window.GO_PostSystem = GO_PostSystem;
