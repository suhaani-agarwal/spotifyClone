console.log("this is js");
let currentsong = new Audio();
let songs = [];
let folder = "";

function convertSecondsToMinutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
}

async function getsong(folder) {
    try {
        let response = await fetch(`http://127.0.0.1:3000/${folder}/`);
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let links = div.getElementsByTagName("a");
        songs = [];
        for (let i = 0; i < links.length; i++) {
            const element = links[i];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

async function getobjsong(folder) {
    try {
        let response = await fetch(`http://127.0.0.1:3000/${folder}/`);
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let links = div.getElementsByTagName("a");
        let obj = {};
        for (let i = 0; i < links.length; i++) {
            const element = links[i];
            if (element.href.endsWith(".mp3")) {
                obj[element.innerHTML] = element.href;
            }
        }
        return obj;
    } catch (error) {
        console.error("Error fetching song objects:", error);
    }
}

async function playsong(fullsong) {
    try {
        let objsong = await getobjsong(folder);
        console.log(objsong);
        const link = objsong[fullsong];
        // if (!link) {
        //     console.error("Song link not found for:", fullsong);
        //     return;
        // }
        currentsong.src = `${link}`;
        currentsong.play();
        document.querySelector(".play").src = "pause.svg";
        document.querySelector(".songinfo").innerHTML = `${fullsong}`;
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    } catch (error) {
        console.error("Error playing song:", error);
    }
}

function updateSongList(songs) {
    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = ''; // Clear the current list
    for (const song of songs) {
        console.log(song)
        let songname = song.split("-")[0];
        let artistname = song.split("-")[1].split(".mp3")[0]
        // artistname = artistname.split(".mp3")[0];
        songul.innerHTML += `
            <li>
                <img src="music.svg" alt="">
                <div class="info">
                    <div class="title">${songname.replaceAll("%20", " ")}</div>
                    <div class="artistname dimtext">${artistname.replaceAll("%20", " ")}</div>
                </div>
                <div class="playnow">Play now</div>
                <img class="invert" src="playbutton.svg" alt="hi">
            </li>`;
    }

    // Attach event listeners to the new song items
    Array.from(songul.getElementsByTagName("li")).forEach(e => {
        let song = e.querySelector(".info").getElementsByClassName("title").innerHTML;
        let artist = e.querySelector(".info").getElementsByClassName("artistname").innerHTML;
        let fullsong = `${song}-${artist}.mp3`;
        e.addEventListener("click", () => {
            console.log(fullsong);
            playsong(fullsong);
        });
    });
}

async function main() {
    // Ensure DOM is fully loaded before running main function
    document.addEventListener("DOMContentLoaded", () => {
        Array.from(document.querySelectorAll(".card")).forEach((e) => {
            e.addEventListener("click", async (item) => {
                folder = item.currentTarget.dataset.folder;
                songs = await getsong(folder);
                console.log(songs);
                updateSongList(songs);
            });
        });

        currentsong.addEventListener("timeupdate", () => {
            let songtime = document.querySelector(".songtime");
            let circle = document.querySelector(".circle");
            if (songtime && circle) {
                songtime.innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)}/${convertSecondsToMinutes(currentsong.duration)}`;
                circle.style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
            }
        });

        
            play.addEventListener("click", () => {
                if (currentsong.paused) {
                    currentsong.play();
                    play.src = "pause.svg";
                } else {
                    currentsong.pause();
                    play.src = "playbar-playbtn.svg";
                }
            });
        

        let seeker = document.querySelector(".seeker");
        if (seeker) {
            seeker.addEventListener("click", (e) => {
                let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
                let circle = document.querySelector(".circle");
                if (circle) {
                    circle.style.left = percent + "%";
                }
                currentsong.currentTime = (currentsong.duration * percent) / 100;
            });
        }

        let hamburger = document.querySelector(".hamburger");
        if (hamburger) {
            hamburger.addEventListener("click", () => {
                let sidebar = document.querySelector(".sidebar");
                if (sidebar) {
                    sidebar.style.left = "0%";
                }
            });
        }

        let closeBtn = document.querySelector(".close");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                let sidebar = document.querySelector(".sidebar");
                if (sidebar) {
                    sidebar.style.left = "-100%";
                }
            });
        }

        
            previous.addEventListener("click", () => {
                let currentlink = currentsong.src.split(`/${folder}/`)[1];
                let index = songs.indexOf(currentlink);
                if (index > 0) {
                    playsong(songs[index - 1].replaceAll("%20", " "));
                }
            });
        

        
            next.addEventListener("click", () => {
                let currentlink = currentsong.src.split(`/${folder}/`)[1];
                let index = songs.indexOf(currentlink);
                if (index < songs.length - 1) {
                    playsong(songs[index + 1].replaceAll("%20", " "));
                }
            });
        

        let volumeControl = document.querySelector(".volume input");
        if (volumeControl) {
            volumeControl.addEventListener("change", (e) => {
                currentsong.volume = parseInt(e.target.value) / 100;
                let volumeIcon = document.querySelector(".volume img");
                if (volumeIcon) {
                    if (e.target.value == 0) {
                        volumeIcon.src = "novolume.svg";
                    } else {
                        volumeIcon.src = "volume.svg";
                    }
                }
            });
        }
    });
}

// Initialize the main function
main();
