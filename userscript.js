// ==UserScript==
// @name         Token Request Button
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  With this script you can get the API token without enabling Multi Company Mode (MCM).
// @author       @78wesley
// @include      /^https:.*3cx.*
// @downloadURL  https://raw.githubusercontent.com/78wesley/script-3cx-apitoken/main/userscript.js
// @grant        GM_xmlhttpRequest
// @grant        GM_cookie
// @run-at       document-end
// ==/UserScript==

(function () {
    "use strict";

    // Function to make the initial request to get the auth token
    function getAuthToken(fqdn, callback) {
        const url = `https://${fqdn}/connect/token`;
        const refreshToken = "RefreshTokenCookie";

        if (!refreshToken) {
            console.log("RefreshTokenCookie not found.");
            return;
        }

        GM_xmlhttpRequest({
            method: "POST",
            url: url,
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
                Cookie: refreshToken,
            },
            data: `client_secret=Webclient&grant_type=refresh_token`,
            onload: function (response) {
                if (response.status === 200) {
                    const jsonResponse = JSON.parse(response.responseText);
                    callback(jsonResponse.access_token);
                } else {
                    console.log("Auth request failed: " + response.statusText);
                }
            },
            onerror: function (response) {
                console.log("Auth request failed: " + response.statusText);
            },
        });
    }

    // Function to make the request to the API endpoint with the obtained auth token
    function makeApiRequest(fqdn, authToken, callback) {
        const url = `https://${fqdn}/xapi/v1/SystemStatus/Pbx.APIToken()`;

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            onload: function (response) {
                // console.log(response.responseText);
                if (response.status === 200) {
                    const jsonResponse = JSON.parse(response.responseText);
                    callback(jsonResponse.value);
                } else {
                    console.log("Auth request failed: " + response.statusText);
                }
            },
            onerror: function (response) {
                console.log("API request failed: " + response.statusText);
            },
        });
    }

    function addButton() {
        // Create a new button element
        var button = document.createElement("button");
        button.innerHTML = "Token";

        // Style the button (optional)
        button.style.marginLeft = "10px";

        // Add an event listener to the button
        button.addEventListener("click", function () {
            const fqdn = window.location.hostname;
            getAuthToken(fqdn, function (authToken) {
                makeApiRequest(fqdn, authToken, function (token) {
                    alert(token);
                });
            });
        });

        // Get the target element
        var targetElement = document.querySelector(
            "body > app > div > div > div > ng-component > layout > div > div > header > div > div > app-webmeeting-activator"
        );

        // Check if the target element exists
        if (targetElement) {
            // Insert the button after the target element
            targetElement.insertAdjacentElement("afterend", button);
        } else {
            console.log("Target element not found.");
        }
    }

    // Main execution
    (function () {
        // Wait for the DOM to be fully loaded before executing the function
        console.log("Custom button Script loaded");
        window.addEventListener("load", addButton);
    })();
})();
