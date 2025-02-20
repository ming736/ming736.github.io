!async function () {
    /**
     * @type {Array<Object>}
     */
    let blogData = null
    /**
 * 
 * @param {string} filename 
 */
    function parseName(filename) {
        if (typeof filename != "string") {
            throw new Error("invalid filename")
        }
        let split = filename.split(".")
        if (split.length != 4) {
            throw new Error("invalid metadata")
        }
        if (isNaN(parseInt(split[0])) === true) {
            throw new Error("invalid id")
        }
        if (!isNaN(parseInt(split[1])) && !split[1].includes("T")) {
            split[1] = parseInt(split[1])
        }
        if (new Date(split[1].replace ? split[1].replace("_", ":") : split[1]).toString() === "Invalid Date") {
            throw new Error("invalid date")
        }
        if (split[3] !== "md") {
            throw new Error("not a post")
        }
        /**
         * 
         * @param {string} input 
         * @returns {string}
         */
        function unescape(input) {
            return input.replace(/#([a-zA-Z0-9]+);/gim,(substr,code)=>{
                return String.fromCodePoint(parseInt(code,16))
            })
        }
        return {
            id: parseInt(split[0]),
            date: new Date(split[1].replace ? split[1].replace("_", ":") : split[1]),
            title: unescape(split[2])
        }
    }
    /**
     * 
     * @returns {Promise<Array<Object>>}
     */
    async function fetchPosts() {
        const user = 'ming736'; // Replace with your GitHub username
        const repo = 'ming736.github.io'; // Replace with your repository name
        const path = '_posts'; // Replace with the folder path
        const url = location.host.includes("localhost") ? `http://localhost:16385/blog_example.json` : `https://api.github.com/repos/${user}/${repo}/contents/${path}`;
        /**
         * @type {Response}
         */
        let safeRes = {
            status: 500,
            statusText: "Internal Server Error"
        };
        try {
            const response = await fetch(url);
            safeRes = response;
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            blogData = result;
            blogData.sort((a, b) => {
                const dateA = parseName(a.name).date;
                const dateB = parseName(b.name).date;
                return dateB - dateA; // Descending order
            });
            return blogData;
        } catch (error) {
            console.error('Error fetching blog posts: ', error);
            return {
                error: `HTTP ${safeRes.status}`,
            }
        }
    }
    async function fetchPost(id) {
        if (blogData == null || blogData instanceof Array == false) {
            throw new Error("cannot fetch post before fetchPosts is called")
        }
        if (isNaN(parseInt(id)) === true) {
            return {
                error: "invalid post id"
            }
        }
        let post = {
            error: "invalid post id"
        }
        for (const v of blogData) {
            if (v.name.split(".")[0] == id.toString()) {
                /**
                 * @type {Response}
                 */
                let safeRes = {
                    status: 500,
                    statusText: "Internal Server Error"
                };
                try {
                    const response = await fetch(v.download_url.replace(/#/g,"%23"));
                    safeRes = response;
                    if (!response.ok) throw new Error('Network response was not ok');
                    const result = await response.text();
                    let meta;
                    try {
                        meta = parseName(v.name)
                    } catch (e) {
                        meta = {
                            content: undefined,
                            error: e.message
                        }
                    }
                    post = {
                        content: result,
                        ...meta
                    };
                } catch (error) {
                    console.error('Error fetching blog post: ', error);
                    post = {
                        error: `HTTP ${safeRes.status}`,
                    };
                }
                break;
            }
        }
        return post
    }
    function toRelative(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count > 0) {
                return count === 1
                    ? `1 ${interval.label} ago`
                    : `${count} ${interval.label}s ago`;
            }
        }

        return 'less than a minute ago';
    }
    let posts = await fetchPosts()
    if (posts.error) {
        document.getElementById("blog-loading").textContent = `Failed to load: ${posts.error}`
        return
    }
    if (urlParams.has("id")) {
        document.getElementById("blog-list").style.display = 'none'
        document.getElementById("blog-list-legacy").style.display = 'none'
        document.getElementById("blog-legacy-h").style.display = 'none'
        document.getElementById("blog-legacy-p").style.display = 'none'
        let post = await fetchPost(parseInt(urlParams.get("id")))
        if (post.error) {
            document.getElementById("blog-loading").textContent = `Failed to load: ${post.error}`
        }
        document.getElementById("blog-post-container").innerHTML = marked.parse(post.content)
        document.getElementById("blog-loading").style.display = 'none'
        document.getElementById("blog-post-title").textContent = post.title
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = post.date.toLocaleDateString('en-US', options);
        document.getElementById("blog-post-date").textContent = `${toRelative(post.date)} - ${formattedDate}`
        document.getElementById("blog-post-date").setAttribute("date", post.date.toString())
        document.getElementById("blog-post").style.display = 'initial'
    } else {
        let blogList = document.getElementById("blog-list")
        let blogListLegacy = document.getElementById("blog-list-legacy")
        posts.forEach((v) => {
            let parsed = parseName(v.name)
            if (parsed.id < 0 && new URLSearchParams(location.search).has("legacy")) {
                blogListLegacy.innerHTML += `
    <li>
        <a href="?id=${parsed.id}">
            <div class="posted-date">${toRelative(parsed.date)}</div>
            <div class="title">${parsed.title}</div>
        </a>
    </li>`
            } else if (parsed.id > -1) {
                blogList.innerHTML += `
    <li>
        <a href="?id=${parsed.id}">
            <div class="posted-date">${toRelative(parsed.date)}</div>
            <div class="title">${parsed.title}</div>
        </a>
    </li>`
            }
        })
        document.getElementById("blog-loading").style.display = 'none'
    }
}()
