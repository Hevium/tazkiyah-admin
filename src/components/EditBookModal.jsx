import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Upload,
  Button,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { apiPost } from "../api/apiInstances";

const { Option } = Select;

const EditBookModal = ({ open, onClose, onSuccess, book }) => {
  const [form] = Form.useForm();
  const [enableFileUpdate, setEnableFileUpdate] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        hide_from_list: values.hide_from_list ? "yes" : "no",
      };

      await apiPost.put(`/api/admin/books/${book._id}`, payload);

      message.success("Book updated successfully");
      onSuccess();
      onClose();
      setEnableFileUpdate(false);
    } catch (error) {
      console.error(error);
      message.error("Failed to update book");
    }
  };

  return (
    <Modal
      title="Edit Book"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Update"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...book,
          hide_from_list: book.hide_from_list === "yes",
        }}
      >
        <Form.Item label="Title" name="title">
          <Input />
        </Form.Item>

        <Form.Item label="Author" name="author">
          <Input />
        </Form.Item>

        <Form.Item label="Price" name="price">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Discount" name="discount">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Published Year" name="published_year">
          <Select>
            {years.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="In Stock"
          name="in_stock"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Hide From Student List"
          name="hide_from_list"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {/* File update toggle */}
        <Form.Item label="Update Thumbnail / PDF">
          <Switch
            checked={enableFileUpdate}
            onChange={setEnableFileUpdate}
          />
        </Form.Item>

        {/* Thumbnail upload */}
        {enableFileUpdate && (
          <Form.Item label="Thumbnail Image">
            <Upload listType="picture" beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>
                Upload Thumbnail
              </Button>
            </Upload>
          </Form.Item>
        )}

        {/* PDF upload */}
        {enableFileUpdate && (
          <Form.Item label="Book PDF">
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>
                Upload PDF
              </Button>
            </Upload>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default EditBookModal;
