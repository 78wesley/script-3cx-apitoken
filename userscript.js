// ==UserScript==
// @name         Token Request Button
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Get API token without enabling Multi Company Mode (MCM).
// @author       @78wesley
// @include      /^https:.*3cx.*
// @downloadURL  https://raw.githubusercontent.com/78wesley/script-3cx-apitoken/main/userscript.js
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function () {
    "use strict";

    const refreshToken = "RefreshTokenCookie"; // Adjust this to your actual cookie value

    // Function to make HTTP requests
    function httpRequest(method, url, headers, data, onload, onerror) {
        GM_xmlhttpRequest({ method, url, headers, data,
            onload(response) { response.status === 200 ? onload(JSON.parse(response.responseText)) : onerror(response.statusText) },
            onerror(response) { onerror(response.statusText) } })}

    // Function to get authorization token
    function getAuthToken(fqdn, callback) {
        const url = `https://${fqdn}/connect/token`;
        if (!refreshToken) { console.log("RefreshTokenCookie not found."); return; }
        httpRequest("POST", url, { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", Cookie: refreshToken }, "client_secret=Webclient&grant_type=refresh_token", response => callback(response.access_token), response => console.log("Auth request failed: " + response))}

    // Function to make API request with auth token
    function makeApiRequest(fqdn, authToken, callback) {
        const url = `https://${fqdn}/xapi/v1/SystemStatus/Pbx.APIToken()`;
        httpRequest("GET", url, { Authorization: `Bearer ${authToken}` }, null, response => callback(response.value), response => console.log("API request failed: " + response))}

    // Function to add button and initiate process
    function addButton() {
        const button = Object.assign(document.createElement("button"), { innerHTML: "API Token", style: "margin-left:10px" });
        button.addEventListener("click", () => getAuthToken(window.location.hostname, authToken => makeApiRequest(window.location.hostname, authToken, token => alert(token))));
        const targetElement = document.querySelector("body > app > div > div > div > ng-component > layout > div > div > header > div > div > app-webmeeting-activator");
        targetElement ? targetElement.insertAdjacentElement("afterend", button) : console.log("Target element not found.")}

    // Main execution
    window.addEventListener("load", () => { console.log("Custom button Script loaded"); setTimeout(addButton, 1000); })})()
