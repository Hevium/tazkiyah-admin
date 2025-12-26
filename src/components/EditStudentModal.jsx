import { Modal, Form, Input, Select, message } from "antd";
import { useEffect } from "react";
import { apiPut } from "../api/apiInstances";

const EditStudentModal = ({ open, onClose, student, onUpdated }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (student) {
      form.setFieldsValue({
        full_name: student.full_name,
        phone: student.phone,
        address: student.address,
        gender: student.gender,
        account_status: student.account_status,
      });
    }
  }, [student, form]);

  const handleUpdate = async (values) => {
    try {
      await apiPut.put(
        "/api/students",
        {
          student_id: student.student_id,
          ...values, // partial update
        }
      );

      message.success("Student updated successfully");
      onClose();
      onUpdated();
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Update failed"
      );
    }
  };

  return (
    <Modal
      title="Edit Student"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Update"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdate}
      >
        <Form.Item label="Full Name" name="full_name">
          <Input />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>

        <Form.Item label="Gender" name="gender">
          <Select>
            <Select.Option value="male">Male</Select.Option>
            <Select.Option value="female">Female</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Address" name="address">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Account Status"
          name="account_status"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="blocked">Blocked</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditStudentModal;
