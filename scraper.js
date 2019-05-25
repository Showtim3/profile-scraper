const cheerio = require("cheerio");
const request = require("request");
const util = require('util');
const fs = require('fs');


let dbObject= {};
let listOfUrls = [];

 function getProfileLinks(){

     return new Promise((resolve , reject) => {

         const URL = "https://www.toptal.com/react";
         request(URL,(error,res,html) => {
             if (!error) {

                 const $ = cheerio.load(html);

                 $('.skill_talent_item-extra').each((i,el) => {
                     const item = $(el);
                     const resume = item.children('a').attr('href');
                     console.log(resume);
                     getProfiles(resume)

                 });
                 resolve();
             }

         });

     });
}

function getProfiles(url) {

     return new Promise((resolve,reject) => {

         request(url,(error,res,html) => {
             if (!error) {
                 const $ = cheerio.load(html);
                 let profilePicURL = $('.resume_top-photo_wrapper').children('img').attr('src');
                 let name = $('.resume_top-info_name').text();
                 let str = $('.resume_top-info_location').text();
                 str = str.split("in");
                 let expertise = str[0].substr(0,str[0].length-1);
                 let location = str[1].substr(1,str[1].length);

                 let memberSince = $('.resume_top-info_since').text();

                 memberSince=memberSince.slice(13,memberSince.length );
                 let introduction = $('.resume_top-info_bio').text();
                 let availability = $('.resume_details-text').text();

                 if(availability[0] === 'P'){
                     availability = "Part-time";
                 }
                 else if(availability[0] === 'Full-time'){
                     availability = "Full-time";
                 }

                 let skillsArray  = [];
                 let categoryArray = ["language","framework","other"];
                 $(".resume_top-tags").children('a').each((i,el)=>{
                     const item = $(el);
                     let tempObj = {
                         name:item.html(),
                         showInProfile:true,
                         experience: Math.floor(Math.random() * Math.floor(10)+1),
                         level:"",
                         category:"language",
                         projects:""
                     };
                     skillsArray.push(tempObj);

                 });

                 skillsArray.pop();

                 // console.log(skillsArray);
                 let skillsObject = skillsArray;
                 //Getting portfolio

                 let portfolioRaw = $(".js-portfolio_section");
                 let portfolioBlock = portfolioRaw.find(".resume_details-list_item");
                 let portfolioObject = [];

                 portfolioBlock.each((i,el) => {
                     let item = $(el);
                     let projectName = item.find('a').text();
                     let techUsed = item.find('.muted').text();
                     let link = "https://"+projectName+".com";
                     let description = "Built " + projectName;
                     let tempObj = {
                         projectName:projectName,
                         techUsed: techUsed,
                         link:link,
                         description:description
                     };
                     portfolioObject.push(tempObj);
                 });

                 let projectObject = {
                     projects : portfolioObject
                 };


                 //Getting Employment
                 let employmentRaw = $(".js-employments");
                 let empBlock = employmentRaw.find(".resume_section-content_item");
                 let empObject = [];
                 empBlock.each((i,el) => {
                     let item = $(el);

                     let profile = item.find(".resume_section-content_title").text();
                     let year = item.find(".resume_section-content_range").text();
                     let organisation = item.find(".resume_section-content_subtitle").text();
                     let detailsRaw = item.find('li').text();
                     let technologies = item.find(".js-technologies").text();
                     year = year.split(' - ');
                     let startYear = year[0];
                     let endYear = year[1];



                     detailsRaw =  detailsRaw.split('.');
                     let detailObj = [];
                     //console.log(detailsRaw);
                     for(let key in detailsRaw){

                         let tempObj = {
                             detail: detailsRaw[key],
                         };
                         detailObj.push(tempObj);
                     }
                     detailObj.pop();

                     //console.log(detailObj);
                     technologies =  technologies.slice(14,technologies.length);
                     technologies = technologies.split(',');

                     let tempObj = {
                         organisation : organisation,
                         startYear:startYear,
                         endYear:endYear,
                         profile : profile,
                         details : detailObj,
                         technologies:technologies
                     };
                     empObject.push(tempObj);
                 });
                 //console.log(empObject);
                 let employmentObject = [];
                 for(let item in empObject){

                     employmentObject.push([empObject[item]]);

                 }

                 // console.log(employmentObject);


                 let experienceRaw = $(".js-experience");
                 let expBlock = experienceRaw.find(".resume_section-content_item");
                 let expObject = [];
                 expBlock.each((i,el) => {
                     let item = $(el);
                     let expTitle = item.find(".resume_section-content_title").text();
                     let expLink = item.find("a").text();
                     let expDescription = item.find('p').text();
                     let tempObj = {
                         expTitle : expTitle,
                         expLink : expLink,
                         expDescription : expDescription
                     };
                     expObject.push(tempObj);
                 });

                 let experienceObject = {
                     exp : expObject,
                 };



                 let educationRaw = $(".js-educations");
                 let eduBlock = educationRaw.find(".resume_section-content_item");
                 let eduObject = [];
                 eduBlock.each((i,el) => {
                     let item = $(el);
                     let eduTitle = item.find(".resume_section-content_title").text();
                     let university = item.find(".resume_section-content_subtitle").text();
                     let tempObj = {
                         degree:eduTitle,
                         university:university
                     };
                     eduObject.push(tempObj);
                 });
                 let educationObject = {
                     education : eduObject
                 };
                 let resumeObj = {
                     name: name,
                     memberSince: memberSince,
                     expertise: expertise,
                     imageLink: profilePicURL,
                     introduction: introduction,
                     location: location,
                     availability: availability,
                     education: educationObject ,
                     employment: employmentObject,
                     experience :experienceObject,
                     projects: projectObject,
                     skills:skillsObject,
                 };

//            console.log(resumeObj);
                 console.log(url.substr(30,url.length));
                 let key = url.substr(30,url.length);
                 let dbTempObj = {};
                 dbTempObj[key] = resumeObj;
                // dbObject.push(dbTempObj);
                dbObject[key] = resumeObj;
                 writeDataToJson(resumeObj);
             }

             else{
                 console.log("Phew!!! Wifi gone again.");
             }
         });
     });
}


function writeDataToJson() {
    const fs = require('fs');
    console.log("Write data to json triggered");
    let finalObject = {
        users:dbObject
    };
    const jsonContent = JSON.stringify(finalObject);
    console.log(jsonContent);

    fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
 }



//
// getProfileLinks().then(() => {
//     writeDataToJson();
// });


getProfileLinks();
