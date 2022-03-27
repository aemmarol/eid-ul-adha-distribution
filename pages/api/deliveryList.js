// import Airtable from "airtable";

// const airtableUserBase = new Airtable({
// 	apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
// }).base("appinryr8YXqHWdt5");

// const fileTableList = airtableUserBase("File List");

// export const getFileListBySubSector = async (group) => {
//     const finalData = [];
//     const returnData = [];
//     await fileTableList
//       .select({
//         maxRecords: 1200,
//         view: "Grid view",
//         filterByFormula: `({subsector} = 'FAKHRI-B')`,
//       }).eachPage(function page(records, fetchNextPage) {
    
//         records.forEach(function(record) {
//             finalData.push(record)
//         });
    
//         fetchNextPage();
    
//     }, function done(err) {
//         // console.log("finalData",finalData);
//         if (err) { console.error(err); return; }
//         return finalData
//     })

//         console.log("finalData",data);

//     // data = data.map((val) => ({ id: val.id, ...val.fields }));
//     // return returnData;
//   };