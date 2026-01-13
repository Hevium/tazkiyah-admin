import { Modal, Form, Input, InputNumber, Switch, Select, message } from "antd";
import { apiPost } from "../api/apiInstances";

const { Option } = Select;

const CreateBookModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        hide_from_list: values.hide_from_list ? "yes" : "no",
      };

      await apiPost.post("/api/admin/books", payload);

      message.success("Book created successfully");

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("Failed to create book");
    }
  };

  return (
    <Modal
      title="Add New Book"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Create"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          in_stock: true,
          hide_from_list: true,
          published_year: currentYear,
        }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Enter book title" />
        </Form.Item>

        <Form.Item
          label="Author"
          name="author"
          rules={[{ required: true, message: "Author is required" }]}
        >
          <Input placeholder="Enter author name" />
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: "Price is required" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Enter book price"
            min={0}
          />
        </Form.Item>

        <Form.Item label="Discount" name="discount">
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Enter discount amount"
            min={0}
          />
        </Form.Item>

        <Form.Item
          label="Published Year"
          name="published_year"
        >
          <Select placeholder="Select published year">
            {years.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            rows={3}
            placeholder="Write short description about the book"
          />
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
      </Form>
    </Modal>
  );
};

export default CreateBookModal;
