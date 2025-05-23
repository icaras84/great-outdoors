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
        topElement.className = output.className + "-top";

        let middleElement = document.createElement("p");
        middleElement.className = output.className + "-middle";

        let bottomElement = document.createElement("p");
        bottomElement.className = output.className + "-bottom";


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

class GO_PostSystem {
    postBuilder = new GO_PostBuilder();
    loadedPosts = [];
    htmlIDToLookup = "";
    jsonArrayVarName = "";

    constructor(postBuilder, htmlIDToLookup, jsonArrayVarName){
        this.postBuilder = postBuilder;
        this.loadedPosts = [];
        this.htmlIDToLookup = htmlIDToLookup;
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

    refreshPostsOntoHTML(){
        let postListHTMLParent = document.getElementById(this.htmlIDToLookup);
        postListHTMLParent.innerHTML = "";
        this.loadedPosts.forEach(post =>
            postListHTMLParent.appendChild(post.toHTML(this.htmlIDToLookup))
        );
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


//export {PostContent, PostBuilder, PostSystem};
window.GO_PostContent = GO_PostContent;
window.GO_PostBuilder = GO_PostBuilder;
window.GO_PostSystem = GO_PostSystem;
