import './reset.css'

let displayTerm: string
let finalString: string
let finalResults: any
let goButton = document.querySelector('#gobutton') as HTMLButtonElement
let randomButton = document.querySelector("#generatebutton") as HTMLButtonElement
let searchTerm = document.querySelector('#searchterm') as HTMLInputElement;
let clearButton = document.querySelector('#clearbutton') as HTMLButtonElement;
let JIKAN_URL = "https://api.jikan.moe/v4/anime"
let paragraph = document.querySelector('#status') as HTMLElement //where the status of the data is shown (searching for, results for, etc.)
let content = document.querySelector("#content") as HTMLElement

//(it shows its a new file, yellow is modified, and red means error inside of it)


const searchButtonClicked = () => {
    let searchInput = searchTerm.value

    displayTerm = searchInput;

    searchInput = searchInput.trim();
    if (searchInput == "") { //if the user types nothing in tell them there is no result
        paragraph.innerHTML = "<b>No results found for \"" + displayTerm + "\"</b>"
        content.innerHTML = ""
        return;
    }

    searchInput = encodeURIComponent(searchInput) //makes it so that we can account for a space in our search
    //and it gets added to the URL

    JIKAN_URL = "https://api.jikan.moe/v4/anime?q=";
    JIKAN_URL += searchInput;

    //console.log(JIKAN_URL)

    paragraph.innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    getDataPromises(JIKAN_URL) //gets the data from the API using the URL

}

const getDataPromises = (url: string) => {
    const request = new Request(
        url,
        { method: 'GET' }
    );
    fetch(request)
        .then((response) => { //sep. callbacks (the return value of the first callback is used in the next callback)(like a chain)
            if (!response.ok) {
                //console.log()
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((returnData) => { //once the response is returned (whole JSON object) then we set the final results to that JSON object
            //and call the dataLoaded function to show the data on the screen and return the finalRestults
            //the .then is chained so thats why the response.JSON is a parameter in the .then
            //console.log(returnData)
            finalResults = returnData
            dataLoaded()
            return finalResults //lets us exit the callback cycle
        })
        .catch((error) => {
            //if the API request fails, let the user know instead of treating it as an empty search
            console.error("Jikan API request failed:", error);
            paragraph.innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
            content.innerHTML = "";
        })
}

//the finalResults is the whole JSON that was returned and the .data is the specific array for the information for that anime
//then if we do another .something thats the items within the data array

const dataLoaded = () => {

    finalString = "";
    if (Array.isArray(finalResults.data) && finalResults.data.length === 0) {
        content.innerHTML = "";
        paragraph.innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return;
    }
    let lengthVal = Array.isArray(finalResults.data) ? finalResults.data.length : -1
    try {
        //console.log("finalResults.length = " + lengthVal);

        if (lengthVal == -1) { //theres no array for a random value (1 value)
            //so we would have to set the length to -1 
            //console.log("random result found")
            //console.log(lengthVal)
            finalString = createAnimeList(finalResults.data);

            content.innerHTML = finalString;
            paragraph.innerHTML = "<b>Success!</b><p><i>Here is a random result</i></p>";

        }

        else {


            for (let i = 0; i < finalResults.data.length; i++) { //go through each anime in the JSON (each object) and give the results
                //in the console 
                let finalResult = finalResults.data[i];
                //console.log(finalResults)
                //console.log(finalResults.data)
                finalString += createAnimeList(finalResult);

            }

            content.innerHTML = finalString;
            paragraph.innerHTML = "<b>Success!</b><p><i>Here are " + finalResults.data.length + " results for '" + displayTerm + "'</i></p>";
        }
    }
    catch (error) {

        //console.log(error)
        paragraph.innerText = `No results for ${displayTerm}`

    }
}



const createAnimeList = (final: any) => {

    //console.log(final)
    let imageURL = final.images?.jpg?.image_url;


    if (!imageURL) {
        imageURL = "./No_Image_Available.webp";
    }
    let url = final.url;

    let trailer_link = final.trailer?.url;
    let trailer_text = "View trailer ↓";
    let trailer_anchor;
    if (trailer_link == null) {
        trailer_link = "";
        trailer_text = "No trailer found";
        trailer_anchor = `<img src='${imageURL}' alt='${final.title}' />`;

    }
    else {
        trailer_anchor = `<a target='_blank' rel='noopener noreferrer' href='${trailer_link}'><img src='${imageURL}' alt='${final.title}' /></a>`;
    }

    if (final.rating == null) {
        final.rating = "No rating given";

    }

    let line = `<div class='result'>Rating: ${final.rating.toUpperCase()}<br/><p class = 'paragraphs'>${trailer_text}</p>${trailer_anchor}${final.title}`;
    line += `<span><a target='_blank' rel='noopener noreferrer' href='${url}'>View on MyAnimeList</a></span></div>`;
    let displayString = line;

    return displayString;

}

const randomButtonClicked = () => {
    let randomURL: string
    randomURL = "https://api.jikan.moe/v4/random/anime"

    paragraph.innerHTML = "<b>Generating a random anime...</b>";
    content.innerHTML = "";

    //console.log(randomURL);
    getDataPromises(randomURL);

}

const clearButtonClicked = () => {
    content.innerText = ""
    paragraph.innerText = "No data yet!"
    searchTerm.value = ""


}

goButton.addEventListener("click", searchButtonClicked)
randomButton.addEventListener("click", randomButtonClicked)
clearButton.addEventListener("click", clearButtonClicked)

searchTerm.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchButtonClicked()
    }
})