import Airtable from "airtable";
import { Button, Col, Form, Input, Modal, Radio, Row, Select } from "antd"
import { useEffect, useState } from "react";
import { Status } from "../pages/list";

export const DeliveryModal = ({ showDeliveryModal, handleClose, fileValue, callback }) => {
    const airtableUserBase = new Airtable({
        apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
    }).base("app7KVWvJtVINBgNM");
    const fileTableList = airtableUserBase("File List");

    const [deliveryForm] = Form.useForm();

    const [selectValue, setselectValue] = useState("")

    const onFinish = async (values) => {
        const user = JSON.parse(localStorage.getItem("eidUser"));
        let data = {
            "status": values.status,
            "Delivered By": user.name || "",
            "Delivered Contact": user.contact || ""
        }
        if (values.collectMsg) {
            data["Collected Notes"] = values.collectMsg
        }
        await fileTableList.update(
            [
                {
                    id: fileValue.id,
                    fields: data,
                },
            ],
            function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
            }
        );

        await callback();
        handleClose();

    }

    const handleSelectChange = (e) => {
        setselectValue(e.target.value)
    }

    return (
        <Modal
            title="Update Delivery Status"
            visible={showDeliveryModal}
            onCancel={handleClose}
            footer={null}
        >
            <Row className="mb-8" gutter={[4, 4]}>
                <Col xs={24}>
                    <span className="text-xs">Name</span>
                    <p className="text-sm">{fileValue.full_name}</p>
                </Col>
                <Col xs={12}>
                    <span className="text-xs">File No</span>
                    <p className="text-sm">{fileValue.file_number}</p>
                </Col>
                <Col xs={12}>
                    <span className="text-xs">Building</span>
                    <p className="text-sm">{fileValue.building}</p>
                </Col>
                <Col xs={12}>
                    <span className="text-xs">Room No</span>
                    <p className="text-sm">{fileValue.room_no}</p>
                </Col>
                <Col xs={12}>
                    <span className="text-xs">Mobile Number</span>
                    <p className="text-sm">{fileValue.mobile_no}</p>
                </Col>
            </Row>
            <Form
                name="deliveryStatus"
                form={deliveryForm}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Status"
                    name="status"
                    rules={[
                        {
                            required: true,
                            message: 'Please select status',
                        },
                    ]} >
                    <Radio.Group onChange={handleSelectChange} >
                        <Radio value={Status.collected.status}>{Status.collected.status}</Radio>
                        <Radio value={Status.notCollected.status}>{Status.notCollected.status}</Radio>
                    </Radio.Group>
                </Form.Item>

                {
                    selectValue === Status.collected.status ?
                        <Form.Item
                            label="Collect notes"
                            name="collectMsg"
                            rules={[
                                {
                                    required: false,
                                    message: 'Please enter reason for return!',
                                },
                            ]}
                        >
                            <Input.TextArea />
                        </Form.Item>
                        : null
                }



                <Form.Item>
                    <Button className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 border-none" type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

        </Modal>
    )
}