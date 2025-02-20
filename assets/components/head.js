const siteBanner = {} /*{
    text: "hi, welcome to the beta version of my new site!",
    bgColor: "green",
    fgColor: "white"
}*/
const topbar = [
    {
        type: "button",
        text: "Home",
        href: "/index.html"
    },
    {
        type: "button",
        text: "Blog",
        href: "/blog.html"
    },
    {
        type: "dropdown",
        text: "Projects",
        contents: [
            /*{
                type: "button",
                text: "MingChat",
                href: "/mingchat.html"
            },*/ // not needed either
            {
                type: "button",
                text: "Windows 93 Docs",
                href: "/w93/2.x/docs"
            },
            {
                type: "button",
                text: "Trollbox Docs",
                href: "/w93/trollbox/2.1/docs"
            },

        ]
    },
    {
        type: "dropdown",
        text: "Socials",
        contents: [
            /*{
                type: "button",
                text: "Twitter",
                href: "https://twitter.com/@ming736_"
            },*/ // i no longer use twitter so
            /*{
                type: "button",
                text: "YouTube",
                href: "https://youtube.com/@ming736_YT"
            },*/ // not really needed i'd say
            {
                type: "button",
                text: "Bluesky",
                href: "https://ming736.bsky.social"
            },
            {
                type: "button",
                text: "GitHub",
                href: "https://github.com/ming736"
            },
        ]
    },
    {
        type: "button",
        text: "View on GitHub <img src='/assets/images/icons/social/github-mark-white.png' class='topbar-img'>",
        tooltip: "View the source of this site on GitHub",
        align: "right",
        href: "https://github.com/ming736/ming736.github.io"
    },
    {
        type: "dropdown",
        text: "Other Stuff",
        align: "right",
        contents: [
            {
                type: "button",
                text: "Increased In Points (classic)",
                tooltip: "By RodriGamer, i worked on it though",
                href: "https://gamerrodri.github.io/increased-in-points-classic/"
            }
        ]
    },
]
class SiteNavbarTop extends HTMLElement {
    constructor() {
        super();
    };
    connectedCallback() {
        function isactive(page) {
            let active = page == (location.pathname == "/" ? "/index.html" : (location.pathname == "/beta.html" ? "/beta.html" : location.pathname)) ? "active" : "inactive"
            //console.log(active, t, t.getAttribute("root")+page)
            return active
        }
        /*
            <a class="${isactive("/beta.html")}" href="/beta.html">Home</a>
            <a class="${isactive("/mingchat.html")}" href="/mingchat.html">MingChat</a>
            <div class="dropdown">
                <button class="dropbtn">Documentation
                    <i class=""></i>
                </button>
                <div class="dropdown-content">
                    <a href="/w93/2.x/docs" class="${isactive("/w93/2.x/docs")}">Windows 93</a>
                    <a href="/w93/trollbox/2.1/docs" class="${isactive("/w93/trollbox/2.1/docs")}">Trollbox</a>
                </div>
            </div>
            <!--<a href="/socialhub/index.html" class="${isactive("/socialhub/index.html")}">Social Hub</a>-->
            <!--<a href="SaveDecrypt.html">FS Save File</a>-->
            <!--<a href="#about">About</a>-->
        */
        this.innerHTML = `
          ${siteBanner.text ? `<div class="site-banner" style="background-color:${siteBanner.bgColor};color:${siteBanner.fgColor}">${siteBanner.text}</div>` : ""}
          <script>
          function myFunction() {
            document.getElementById("myDropdown").classList.toggle("show");
          }
          window.onclick = function(event) {
            if (!event.target.matches('.dropbtn')) {
              var dropdowns = document.getElementsByClassName("dropdown-content");
              var i;
              for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                  openDropdown.classList.remove('show');
                }
              }
            }
          }
          </script>
          <header>
            <div class="topnav" id="topbar">
            </div>
          </header>
          `;
        /**
         * @param {Array} button 
         */
        function createButton(button) {
            return `<a ${button.tooltip ? `title="${button.tooltip} " ` : ""} ${button.align ? `style="float: ${button.align}" ` : ""}class="${isactive(button.href)}" href="${button.href}${button.href.startsWith("/") ? "" : ""}" ${button.href.startsWith("/") ? "" : "target=\"_blank\""}>${button.text + (button.href.startsWith("/") ? "" : " <img src='/assets/images/icons/material/open_in_new.128px.png' class='topbar-oin'>")}</a>`
        }
        function createDropdown(dropdown) {
            let btns = ""
            dropdown.contents.forEach((v) => {
                btns += "\n"+createButton(v)
            })
            return `<div class="dropdown" ${dropdown.align ? `style="float: ${dropdown.align}" ` : ""}>
    <button class="dropbtn"${dropdown.tooltip ? `title="${dropdown.tooltip} " ` : ""}>${dropdown.text}
        <i class=""></i>
    </button>
    <div class="dropdown-content">
        ${btns}
    </div>
</div>`
        }
        let topbarEl = document.getElementById("topbar")
        topbar.forEach((v) => {
            if (v.type == 'button') {
                topbarEl.innerHTML += createButton(v)
            } else if (v.type == 'dropdown') {
                topbarEl.innerHTML += createDropdown(v)
            }
        })
    }
}
/**
 * 
 * @param {string} downloaddata 
 */

function download(downloaddata) {
    const dataArr = downloaddata.split(";", 2)
    const downloadType = dataArr[0]
    const downloadLink = dataArr[1]
    if (downloadType == "external") {
        window.location.href = downloadLink
    }
}
class SiteDownload extends HTMLElement {
    constructor() {
        super()
    }
    connectedCallback() {
        let reltype = this.getAttribute("latest") == "" ? "latest" : this.getAttribute("release") == "" ? "release" : this.getAttribute("beta") == "" ? "beta" : "alpha"
        console.log(reltype)
        this.innerHTML = `
      <div class="download-frame">
              <span style="color:${reltype == "latest" ? "lime" : reltype == "yellow" ? "blue" : reltype == "beta" ? "blue" : "red"}">${reltype.toUpperCase()}</span>
              <strong class="download-frame-name">${this.getAttribute("name")}</strong>
              <p class="download-frame-desc">${this.getAttribute("desc")}</p>
              <button class="downloadbtn" type="button" value="${this.getAttribute("ref")}" title="Download"  onclick="download(this.value)" >Download</button>
        </div>
      `
    }
}
customElements.define('download-frame', SiteDownload);
customElements.define('navbar-top', SiteNavbarTop);
