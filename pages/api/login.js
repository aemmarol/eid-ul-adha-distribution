// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Airtable from "airtable";

const airtableUserBase = new Airtable({
	apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
}).base("appSxp1gD2zBFvvg0");

const userTableList = airtableUserBase("userList");


export const login = async (its) => {
	const userData = await userTableList
		.select({
			view: "Grid view",
			filterByFormula: `({itsId} = '${its}')`,
		})
		.firstPage();

	if (!userData.length) {
		return {type:"error",msg:"user not found"};
	} else {
		let data = userData[0].fields;
		return {type:"success",data};
	}
}