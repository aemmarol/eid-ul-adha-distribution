import { Button, Card, Col, Layout, Modal, Row, Spin } from "antd";
import Head from "next/head"
import { useEffect, useState } from "react";
import { FiAlertCircle, FiXCircle, FiCheckCircle } from "react-icons/fi";
import Airtable from "airtable";
import { useRouter } from "next/router";
import { DeliveryModal } from "../components/deliveryModal";

const { Header, Content } = Layout;

const ListPage = () => {

    const airtableUserBase = new Airtable({
        apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
    }).base("appinryr8YXqHWdt5");
    const fileTableList = airtableUserBase("File List");

    const router = useRouter();

    const [userDetails, setUserDetails] = useState({});
    const [zoneDetails, setZoneDetails] = useState([]);
    const [fileDetails, setFileDetails] = useState([]);
    const [selectedFile, setSelectedFile] = useState({});
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [showLoader, setshowLoader] = useState(false);


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            router.push("/")
        } else {
            setUserDetails(user);
            getFileListBySubSector(user.zone[0])
        }
    }, [])

    useEffect(() => {
        if (zoneDetails.length > 0) {
            getFileDetails(zoneDetails)
        }
    }, [zoneDetails])



    const getFileListBySubSector = async (zone) => {
        const finalData = [];
        setshowLoader(true)
        await fileTableList
            .select({
                maxRecords: 1200,
                view: "Grid view",
                filterByFormula: `({zone} = '${zone}')`,
            }).eachPage(function page(records, fetchNextPage) {

                records.forEach(function (record) {
                    finalData.push(record)
                });

                fetchNextPage();

            }, function done(err) {
                setZoneDetails(finalData.map(val => ({ ...val.fields, id: val.id })));
                if (err) { console.error(err); return; }
            })

        setshowLoader(false)
    };

    const getFileDetails = (data) => {
        let sectorFileData = data.filter(val => userDetails.assignedArea.includes(val.subsector));
        setFileDetails(sectorFileData)
    }

    const handleShowDeliveryModal = (fileValue) => {
        setSelectedFile(fileValue)
        setShowDeliveryModal(true)

    }

    const handleLogout = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            localStorage.clear();
            router.push("/")
        }
    }

    return (
        <Layout className="min-h-screen overflow-y-auto ">
            <Head>
                <title>AEM Distribution</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <Header className="h-20 p-0 flex px-4 items-center" >
                <p className="whitespace-nowrap text-lg text-white text-ellipsis overflow-hidden flex-grow">{userDetails.name}</p>
                <Button onClick={handleLogout} className="ml-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300">Logout</Button>
            </Header>
            {
                showLoader ?
                    <div className="absolute z-50 top-0 left-0 w-screen h-screen bg-white/70 flex items-center justify-center" >
                        <Spin size="large" />
                    </div>
                    : null
            }
            <Content className="px-4 py-6">
                <div className="w-full">
                    <div className="w-full flex items-start mb-8">
                        <h3 className="text-2xl">Sectors</h3>
                        <h3 className="text-2xl mx-1">:</h3>
                        <p className="flex-grow text-xl mt-1">{userDetails && userDetails.assignedArea && userDetails.assignedArea.join(" , ")}
                        </p>
                    </div>
                    <Row gutter={[16, 16]}>
                        <Col xs={12} md={8} lg={6} xl={4} >
                            <Card className="p-0 rounded-lg">
                                <div className="flex">
                                    <span className="flex items-center justify-center w-12 text-5xl mr-4 text-amber-500">
                                        <FiAlertCircle />
                                    </span>
                                    <div className="flex flex-col flex-grow">
                                        <p className="text-xs">pending</p>
                                        <p className="text-4xl text-amber-500">{fileDetails.filter(val => !val.status || val.status === "To be dispatched" || val.status === "Dispatched").length}</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={12} md={8} lg={6} xl={4} >
                            <Card className="p-0 rounded-lg">
                                <div className="flex">
                                    <div className="flex items-center justify-center w-12 text-5xl mr-4 text-lime-600">
                                        <FiCheckCircle />
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <p className="text-xs">delivered</p>
                                        <p className="text-4xl text-lime-600">{fileDetails.filter(val => val.status === "Delivered").length}</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={12} md={8} lg={6} xl={4} >
                            <Card className="p-0 rounded-lg">
                                <div className="flex">
                                    <div className="flex items-center justify-center w-12 text-5xl mr-4 text-red-600">
                                        <FiXCircle />
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <p className="text-xs">returned</p>
                                        <p className="text-4xl text-red-600">{fileDetails.filter(val => val.status === "Returned").length}</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <div className="w-full flex items-start my-8">
                        <h3 className="text-2xl">Pending List</h3>
                        <h3 className="text-2xl mx-1">:</h3>
                    </div>
                    {
                        userDetails && userDetails.assignedArea && userDetails.assignedArea.length > 0 ? userDetails.assignedArea.map(area => (
                            <div key={area}>
                                <h1 className="text-lg my-2">{area}</h1>
                                {
                                    fileDetails
                                        .filter(value => !value.status || value.status === "To be dispatched" || value.status === "Dispatched")
                                        .filter(areaValue => areaValue.subsector === area)
                                        .map((val, index) => (
                                            <Card key={val.id} className=" padding-0-card rounded-lg mb-2" >
                                                <div className="flex px-2 py-2">
                                                    <div className="flex flex-col flex-grow">
                                                        <Row gutter={[4, 4]}>
                                                            <Col xs={24}>
                                                                <span className="text-xs">Name</span>
                                                                <p className="text-sm">{val.full_name}</p>
                                                            </Col>
                                                            <Col xs={12}>
                                                                <span className="text-xs">File No</span>
                                                                <p className="text-sm">{val.file_number}</p>
                                                            </Col>
                                                            <Col xs={12}>
                                                                <span className="text-xs">Room No</span>
                                                                <p className="text-sm">{val.room_no}</p>
                                                            </Col>
                                                            <Col xs={24}>
                                                                <span className="text-xs">Address</span>
                                                                <p className="text-sm">{val.address}</p>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                    <div className="ml-4">
                                                        <Button onClick={() => handleShowDeliveryModal(val)} >Deliver</Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                }
                            </div>
                        )) : null
                    }
                </div>
            </Content>
            {
                showDeliveryModal ?
                    <DeliveryModal
                        showDeliveryModal={showDeliveryModal}
                        handleClose={() => setShowDeliveryModal(false)}
                        fileValue={selectedFile}
                        callback={async () => {
                            await getFileListBySubSector(userDetails.zone[0])
                        }}
                    />
                    : null
            }
        </Layout>
    )
}

export default ListPage