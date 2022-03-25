// Node Modules
const dns = require('dns');

// Models
const Url = require('../models/Url');
const Counter = require('../models/Counter');

// Handler to post new URLs
module.exports.postUrl = (req, res) => {

    // Defining error response
    const err_response = { error: 'invalid url' };

    // Extract the URL from request body
    let original_url = req.body.url;

    // Validate URL format using Regex -  [Regex string obtained from - https://www.geeksforgeeks.org/check-if-an-url-is-valid-or-not-using-regular-expression/]
    let urlRegex = new RegExp("((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)");
    if(!urlRegex.test(original_url)){
        return res.json(err_response);
    }

    // Extract [(http/https)://] from the original_url since dns.lookup requires just hostname
    let positionOfSlash = original_url.indexOf('://');
    let hostname = original_url.slice(positionOfSlash + 3);

    // Check if the hostname exists using dns.lookup(host, cb)
    dns.lookup(hostname || '', (err, data) => {

        // If invalid URL, return { error: 'invalid url' }
        if(err){
            return res.json(err_response);
        }

        // Search the url collection to check if the URL already exists
        Url.findOne({ originalUrl: original_url }).then(urlFound => {

            // NOTE: Tried using findOneAndUpdate() with { upsert:true, overwrite:false } but it leads to an issue where if the URL was found, the counter got incremented which was incorrect.
            //       Thus, had to use this approach where we find the URL first. If not found, insert a new entry.

            if(urlFound){

                // URL was found. Return the details.
                return res.json({
                    original_url: urlFound.originalUrl, 
                    short_url: urlFound.shortUrl
                });

            } else {

                // URL was not found

                // Increment the counter (in the counter collection) and fetch that number
                Counter.findOneAndUpdate({}, {$inc: {shortUrlCounter: 1}}, {new: true}).then(shortUrl => {

                    // Insert a new document in 'urls' collection
                    Url.create({
                        originalUrl: original_url,
                        shortUrl: shortUrl.shortUrlCounter
                    }).then(urlDoc => {

                        // Document was inserted successfully. Return the url details.
                        return res.json({
                            original_url: urlDoc.originalUrl, 
                            short_url: urlDoc.shortUrl
                        });

                    }).catch(err => {
                        return res.json({ err: err, code: 3});
                    });

                }).catch(err => {
                    return res.json({ err: err, code: 2});
                });

            }

        }).catch(err => {
            return res.json({ err: err, code: 1});
        });
    });
}

// Handler to fetch (and then reroute) the short url
module.exports.getUrl = (req, res) => {
    // Extract route params
    let shortUrlId = req.params.id;

    // Sanity check
    if(shortUrlId && (parseInt(shortUrlId) && !isNaN(parseInt(shortUrlId)))){

        // Query urls collection
        Url.findOne({
            shortUrl: shortUrlId
        }).then(urlFound => {

            // If the URL was found, redirect to that URL. Else respond 'URL Not Found'.
            if(urlFound){
                res.redirect(urlFound.originalUrl);
            }else{
                res.json({ error: "URL Not Found" });
            }

        }).catch(err => {
            return res.json({ err: err, code: 1});
        });

    }else{
        res.json({ error: "Wrong format" });
    }
}