
class BlogPost extends GO_PostContent{
    replies = [];


    constructor(title, timestamp, content, replies) {
        super(title, timestamp, content);
        this.replies = replies;
    }


    toJson() {
        return JSON.stringify(this);
    }


    toHTML(parentId) {
        let output = super.toHTML(parentId);
        let replySection = document.createElement("ul");
        replySection.className = output.className + "-replies";
        this.replies.forEach(reply => {
            replySection.appendChild(reply.toHTML(parentId));
        })
        output.appendChild(replySection);
        return output;
    }
}

class BlogPostBuilder extends GO_PostBuilder{

    fromJsonObject(jsonObject) {
        let replies = [];
        jsonObject.replies.forEach(reply => {
            replies.push(this.fromJsonObject(reply));
        })
        return new BlogPost(jsonObject.title, jsonObject.timestamp, jsonObject.content, replies);
    }
}

let blogPostBuilder = new BlogPostBuilder();
let blogSys = new GO_PostSystem(blogPostBuilder, "blog-feed", "blogList");

// debug function to load a JSON file of announcements by fetch request
function debugTestBlog(idx){
    fetch(`./json/blogs/test/blogTest${idx}.json`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            blogSys.loadFromJson(data);
            blogSys.refreshPostsOntoHTML();
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
}