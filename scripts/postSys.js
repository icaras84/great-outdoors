// A class that contains what the post entails plus a method to create the HTML for it
class GO_PostContent {
    title ="";
    timestamp = Date.now().toString();
    content = "";

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
    toHTML(parentId, idx){
        let output = document.createElement("div");
        output.className = parentId + "-item";
        output.id = `${idx}/`;
        console.log(`class: ${output.className} id: ${output.id}`);


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

// builder interprets a json and builds a model of the post
class GO_PostBuilder {
    // accepts a json obj and parses a post (main method to override for a custom builder with custom json)
    fromJsonObject(jsonObject) {
        return new GO_PostContent(jsonObject.title, jsonObject.timestamp, jsonObject.content);
    }

    // accepts a json string and parses a post
    fromJsonString(jsonString) {
        return this.fromJsonObject(JSON.parse(jsonString));
    }
}

// a class to represent all the loaded posts and what the class should look for when parsing a json object to get the array of posts
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
        this.loadedPosts = this.loadedPosts.filter(postIn => postIn.id !== post.id);
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

// a class to control where the post is shown in the HTML
class GO_PostView {
    htmlIDToLookup = "";

    constructor(htmlIDToLookup) {
        this.htmlIDToLookup = htmlIDToLookup;
    }

    pasteOntoHTML(posts){
        let postListHTMLParent = document.getElementById(this.htmlIDToLookup);
        postListHTMLParent.innerHTML = "";

        for (let idx = 0; idx < posts.length; idx++) {
            postListHTMLParent.appendChild(posts[idx].toHTML(this.htmlIDToLookup, idx));
        }
    }
}

// a class to store a date interval
class GO_DateRange {
    _beginDate;
    _endDate;
    _mode = "SINGLE";

    _beginTime;
    _endTime;


    constructor(beginDate, endDate) {
        this._beginDate = beginDate;
        this._endDate = endDate;
        this._beginTime = beginDate.getTime();
        this._endTime = endDate.getTime();
    }

    singleDateMode(){
        this._mode = "SINGLE";
        this._beginTime = this._beginDate.getTime();
        this._endTime = this._beginDate.getTime();
    }

    rangeDateMode(){
        this._mode = "RANGE";
        this._beginTime = this._beginDate.getTime();
        this._endTime = this._endDate.getTime();
    }

    setLowerDate(date){
        this._beginDate = date;
    }

    setUpperDate(date){
        this._endDate = date;
    }

    scoreTime(timestamp){
        let postTime = Date.parse(timestamp);
        let lowerTimestampScore = postTime - this._beginTime;
        let upperTimestampScore = this._endTime - postTime;

        return [lowerTimestampScore, upperTimestampScore];
    }
}

// a class to store the regex required to complete a search
class GO_SearchQuery {
    titleRegex = new RegExp('', 'g');
    timestampFilter = new GO_DateRange(new Date(), new Date());
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

    // scoring function attributes a value to each post that is based on the number of matches within the post
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
        let timestampScore = this.timestampFilter.scoreTime(post.timestamp);

        return [titleScore, contentScore, timestampScore[0], timestampScore[1]];
    }

    // filter out posts that do and don't match the criterion
    filterFunc(post){
        let scores = this.scoringFunc(post);
        let titleResult = this.targetTitle ? scores[0] > 0 : true;
        let contentResult = this.targetContent ? scores[1] > 0 : true;
        let timestampResult = this.targetTimestamp ? (scores[2] > 0 && scores[3] < 0) : true;
        return titleResult && contentResult && timestampResult;
    }

    // sorting function to dictate order of which posts are shown in via score value
    compareFunc(postA, postB){
        let scoreA = this.scoringFunc(postA);
        let scoreB = this.scoringFunc(postB);

        let titleComparison = this.ascendingTitleScore ? scoreA[0] - scoreB[0] : scoreB[0] - scoreA[0];
        let contentComparison = this.ascendingContentScore ? scoreA[1] - scoreB[1] : scoreB[1] - scoreA[1];
        let timestampComparison = this.ascendingTimestampScore ? scoreA[2] - scoreB[2] : scoreB[2] - scoreA[2];

        return titleComparison + contentComparison + timestampComparison;
    }
}

// a class that acts as the controller for the model and view components (resulting in the MVC pattern)
class GO_PostSystem {
    postModel = new GO_PostModel();
    postBuilder = new GO_PostBuilder();
    postView = new GO_PostView();

    searchQuery = new GO_SearchQuery();
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

    // filters and then sorts the intermediate posts (that should be rendered)
    filterPosts(searchQuery){
        this.intermediatePosts = this.postModel.loadedPosts.filter(post => searchQuery.filterFunc(post));
        this.intermediatePosts.sort((a, b) => this.searchQuery.compareFunc(a, b));
    }

    // render intermediate posts unto the page dictated by the view
    refreshPostsOntoHTML(){
        this.filterPosts(this.searchQuery)
        this.postView.pasteOntoHTML(this.intermediatePosts);
    }

    // wrapper method for loading the model from a json obj
    loadFromJson(jsonObj){
        this.postModel.loadFromJson(jsonObj);
    }
}


// bind the classes declared here to the window so they're in global scope instead of being file-specific
window.GO_PostContent = GO_PostContent;
window.GO_PostBuilder = GO_PostBuilder;

window.GO_PostView = GO_PostView;
window.GO_PostModel = GO_PostModel;
window.GO_PostSystem = GO_PostSystem;
window.GO_SearchQuery = GO_SearchQuery;