import React, {useState, useEffect} from "react"
import {InboxOutlined} from "@ant-design/icons"
import type {UploadProps} from "antd"
import { Descriptions, Space, Upload} from "antd"
import type {DescriptionsProps} from "antd"
import {Button, Input} from 'antd';
import ImageWithCrosshair from "./ImageWithCrosshair";

const {Dragger} = Upload

const {Search} = Input;
const LocateElement: React.FC = ({apigateway}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [productInfo, setProductInfo] = useState({})
    const [processingStatus, setProcessingStatus] = useState("default")
    const [description, setDescription] = useState('');


    useEffect(() => {
        // Clean up the object URL when the component unmounts or when the file changes
        return () => {
            if (selectedFile) {
                URL.revokeObjectURL(getImageUrl());
            }
        };
    }, [selectedFile]);

    const items: DescriptionsProps["items"] = [
        {
            key: "1",
            label: "X",
            children: productInfo.x_coordinate
        },
        {
            key: "2",
            label: "Y",
            children: productInfo.y_coordinate
        },
        {
            key: "3",
            label: "Width",
            children: productInfo.width,
            span: 2
        }, {
            key: "4",
            label: "Height",
            children: productInfo.height
        }, {
            key: "5",
            label: "Description",
            children: productInfo.description
        }
    ]

    const handleScreenshot = () => {


        if (description && selectedFile) {


            const formData = new FormData()
            formData.append("screenshot", selectedFile)
            formData.append("description", description)
            setProcessingStatus("processing")
            fetch(apigateway, {
                method: "POST",
                body: formData
            }).then(response => {
                console.log("response", response)
                if (response.ok) {
                    response.json().then(data => {
                        setProductInfo(data.result)
                        setProcessingStatus("success")
                    })
                } else {
                    setProcessingStatus("error")
                    console.error("Error uploading file:", response.status)
                }

            }).catch(error => {
                setProcessingStatus("error")
                setProductInfo({description: error.toString()})
                console.error("Error uploading file:", error)
            })
        }
    }

    const getImageUrl = () => {
        if (selectedFile) {
            return URL.createObjectURL(selectedFile);
        }
        return null;
    };
    const handleInputChange = (event) => {
        setDescription(event.target.value);
    };

    const props: UploadProps = {
        onRemove: (file) => {
            setSelectedFile(null);
            setDescription("")
        },
        beforeUpload: (file) => {
            setSelectedFile(file);
            setDescription("")
            return false;
        }
    }

    const thoughDescription = productInfo.description

    return <>
        <Dragger {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined/>
            </p>
            <p className="ant-upload-text">Click or drag a screenshot of a website</p>
            <p className="ant-upload-hint">
                Support for a single upload. Strictly prohibited from uploading company data or other
                banned files.
            </p>
        </Dragger>


        <Space direction="vertical" size={32}>


            <ImageWithCrosshair
                width={1024}
                imageSrc={getImageUrl()}
                crosshairData={productInfo}
            />


            <Search placeholder="Element to find in the screenshot"
                    enterButton="Get Coordinate"
                    size="large"
                    onChange={handleInputChange}
                    value={description}
                    loading={processingStatus === "processing"}
                    onSearch={handleScreenshot}/>

            {description &&
            <Descriptions title="Element info"
                          column={5}
                          bordered
                          items={items}/>
            }

        </Space>
    </>
}

export default LocateElement