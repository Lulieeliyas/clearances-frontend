// FormLinkedPaymentPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Button,
  Alert,
  Steps,
  Form,
  Input,
  Select,
  Upload,
  DatePicker,
  Descriptions,
  Tag,
  Modal,
  message,
  Space,
  Typography,
  Divider,
  Result,
  Spin
} from "antd";
import {
  UploadOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { API_BASE } from '../../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

export default function FormLinkedPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  // State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form and payment data
  const [formData, setFormData] = useState(null);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [requiredDepartment, setRequiredDepartment] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");
  const [hasExistingPayment, setHasExistingPayment] = useState(false);
  const [existingPayment, setExistingPayment] = useState(null);
  
  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const formId = queryParams.get('form_id');
  const department = queryParams.get('department');
  const amount = queryParams.get('amount');
  const reason = queryParams.get('reason');

  useEffect(() => {
    const stored = sessionStorage.getItem("ucs_current");
    if (!stored) {
      message.error("Please login first");
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(stored);
    if (parsed.role !== "student") {
      message.error("Access denied. Students only.");
      navigate("/login");
      return;
    }

    setUser(parsed);
    setToken(parsed.token);
    
    // Load initial data
    loadInitialData(parsed.token);
  }, [navigate]);

  const loadInitialData = async (authToken) => {
    try {
      setLoading(true);
      
      // Load payment methods
      const methodsRes = await axios.get(`${API_BASE}payment/methods/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      setPaymentMethods(methodsRes.data);
      
      // If form_id is provided, load form details and payment status
      if (formId) {
        await loadFormPaymentStatus(authToken, formId);
      }
      
      // If pre-filled data from URL
      if (department) {
        form.setFieldsValue({ 
          department_type: department,
          amount: amount || ''
        });
      }
      
      if (reason) {
        form.setFieldsValue({ 
          note: `Payment for: ${reason}`
        });
      }
      
    } catch (err) {
      console.error("Error loading initial data:", err);
      message.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const loadFormPaymentStatus = async (authToken, formId) => {
    try {
      const response = await axios.get(
        `${API_BASE}forms/${formId}/payment-status/`,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      
      const data = response.data;
      setFormData(data);
      setPaymentRequired(data.payment_required);
      setRequiredDepartment(data.required_department);
      setRejectionNote(data.rejection_note);
      setHasExistingPayment(data.has_verified_payment);
      setExistingPayment(data.verification_info);
      
      // If form requires payment, pre-fill form
      if (data.payment_required && data.required_department) {
        form.setFieldsValue({ 
          department_type: data.required_department,
          note: `Payment for clearance form #${formId}`
        });
      }
      
    } catch (err) {
      console.error("Error loading form payment status:", err);
      message.error("Failed to load form details");
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // Validate file
      if (!fileList.length || !fileList[0]?.originFileObj) {
        message.error("Please upload a receipt");
        setSubmitting(false);
        return;
      }
      
      const formData = new FormData();
      formData.append("payment_method_id", values.payment_method_id);
      formData.append("department_type", values.department_type);
      formData.append("transaction_id", values.transaction_id);
      formData.append("amount", parseFloat(values.amount));
      formData.append("payment_date", values.payment_date.format("YYYY-MM-DD"));
      
      // Add form_id if available (CRUCIAL FOR LINKING)
      if (formId) {
        formData.append("clearance_form_id", formId);
      }
      
      if (values.phone_number) {
        formData.append("phone_number", values.phone_number);
      }
      if (values.account_last_digits) {
        formData.append("account_last_digits", values.account_last_digits);
      }
      if (values.note) {
        formData.append("note", values.note);
      }
      
      formData.append("receipt_file", fileList[0].originFileObj);
      
      const response = await axios.post(
        `${API_BASE}payment/submit-with-form/`, 
        formData, 
        {
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      message.success(response.data.message);
      
      // Show success modal with next steps
      Modal.success({
        title: "Payment Submitted Successfully",
        content: (
          <div>
            <p>Your payment has been submitted for verification.</p>
            {formId && (
              <Alert
                message="Clearance Form Update"
                description="Your clearance form will be automatically approved once payment is verified by the department staff."
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
            <p>Transaction ID: <strong>{values.transaction_id}</strong></p>
            <p>Amount: <strong>ETB {values.amount}</strong></p>
            <p>Department: <strong>{values.department_type.toUpperCase()}</strong></p>
            <p>Reference: <strong>{values.note || 'No reference'}</strong></p>
          </div>
        ),
        onOk: () => {
          // Navigate based on whether it's linked to a form
          if (formId) {
            navigate(`/student?tab=tracking`);
          } else {
            navigate("/student/payments");
          }
        }
      });
      
    } catch (err) {
      console.error("Payment submission error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Payment submission failed";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";
    if (!isImage && !isPDF) {
      message.error("You can only upload JPG, PNG, or PDF files!");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 10) {
      message.error("File must be smaller than 10MB!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const renderFormHeader = () => {
    if (!formId) {
      return (
        <Card
          title={
            <Space>
              <DollarOutlined />
              <span>Make a Payment</span>
            </Space>
          }
          extra={
            <Button onClick={() => navigate("/student")}>
              <ArrowLeftOutlined /> Back to Dashboard
            </Button>
          }
        >
          <Alert
            message="General Payment"
            description="This is a general payment submission. If your clearance form requires payment, please use the link from the rejection notification."
            type="info"
            showIcon
          />
        </Card>
      );
    }

    return (
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>Payment for Clearance Form #{formId}</span>
            {paymentRequired && <Tag color="orange">Payment Required</Tag>}
          </Space>
        }
        extra={
          <Space>
            <Button onClick={() => navigate(`/student?tab=tracking`)}>
              Back to Form Tracking
            </Button>
          </Space>
        }
      >
        {paymentRequired ? (
          <Alert
            message={`${requiredDepartment.toUpperCase()} Payment Required`}
            description={
              <div>
                <p><strong>Reason:</strong> {rejectionNote}</p>
                {hasExistingPayment && existingPayment && (
                  <Alert
                    message="Verified Payment Found"
                    description={
                      <div>
                        <p>You have a verified payment for this requirement:</p>
                        <p><strong>Transaction:</strong> {existingPayment.transaction_id}</p>
                        <p><strong>Amount:</strong> ETB {existingPayment.amount}</p>
                        <p><strong>Verified at:</strong> {dayjs(existingPayment.verified_at).format('MMM D, YYYY HH:mm')}</p>
                      </div>
                    }
                    type="success"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            }
            type="warning"
            showIcon
          />
        ) : (
          <Alert
            message="No Payment Required"
            description="This form doesn't require any payment at this stage."
            type="info"
            showIcon
          />
        )}
      </Card>
    );
  };

  const renderPaymentForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        department_type: requiredDepartment || "library",
        payment_date: dayjs()
      }}
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Payment Details" />
        <Step title="Upload Receipt" />
        <Step title="Review & Submit" />
      </Steps>

      {currentStep === 0 && (
        <>
          {formId && (
            <Form.Item 
              name="note" 
              label="Payment Reference"
              initialValue={`Payment for clearance form #${formId}`}
            >
              <Input.TextArea
                rows={2}
                placeholder="Reference note (e.g., Clearance Form #1234 - Library Dues)"
                disabled={hasExistingPayment}
              />
            </Form.Item>
          )}
          
          <Form.Item
            name="department_type"
            label="Department"
            rules={[{ required: true, message: "Please select department" }]}
          >
            <Select 
              placeholder="Select department"
              disabled={hasExistingPayment || (formId && requiredDepartment)}
            >
              <Option value="library">Library</Option>
              <Option value="cafeteria">Cafeteria</Option>
              <Option value="dormitory">Dormitory</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="payment_method_id"
            label="Payment Method"
            rules={[{ required: true, message: "Please select payment method" }]}
          >
            <Select placeholder="Select payment method" disabled={hasExistingPayment}>
              {paymentMethods.map((method) => (
                <Option key={method.id} value={method.id}>
                  {method.name.toUpperCase()} - {method.account_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="transaction_id"
            label="Transaction ID"
            rules={[{ required: true, message: "Please enter transaction ID" }]}
          >
            <Input 
              placeholder="Enter transaction/reference ID from payment" 
              disabled={hasExistingPayment}
            />
          </Form.Item>
          
          <Form.Item
            name="amount"
            label="Amount (ETB)"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <Input 
              type="number" 
              min="1" 
              step="0.01" 
              placeholder="Enter amount paid" 
              disabled={hasExistingPayment}
            />
          </Form.Item>
          
          <Form.Item
            name="payment_date"
            label="Payment Date"
            rules={[{ required: true, message: "Please select payment date" }]}
          >
            <DatePicker 
              format="YYYY-MM-DD" 
              style={{ width: "100%" }} 
              disabled={hasExistingPayment}
            />
          </Form.Item>
          
          <Form.Item name="phone_number" label="Phone Number (Optional)">
            <Input 
              placeholder="Phone number used for payment" 
              disabled={hasExistingPayment}
            />
          </Form.Item>
          
          <Form.Item name="account_last_digits" label="Account Last 4 Digits (Optional)">
            <Input 
              placeholder="Last 4 digits of account/card" 
              maxLength={4} 
              disabled={hasExistingPayment}
            />
          </Form.Item>
          
          <Button
            type="primary"
            onClick={async () => {
              try {
                const values = await form.validateFields();
                setCurrentStep(1);
              } catch (error) {
                console.log("Validation failed:", error);
              }
            }}
            disabled={hasExistingPayment}
          >
            Next: Upload Receipt
          </Button>
        </>
      )}

      {currentStep === 1 && (
        <>
          <Form.Item
            name="receipt_file"
            label="Upload Receipt"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList || []}
            rules={[{ required: true, message: "Please upload receipt" }]}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              maxCount={1}
              disabled={hasExistingPayment}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div>Upload Receipt</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          
          <Alert
            message="Receipt Requirements"
            description="Upload clear image or PDF of your payment receipt showing transaction ID, amount, and date."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Space>
            <Button onClick={() => setCurrentStep(0)}>Previous</Button>
            <Button 
              type="primary" 
              onClick={() => setCurrentStep(2)}
              disabled={hasExistingPayment || fileList.length === 0}
            >
              Next: Review
            </Button>
          </Space>
        </>
      )}

      {currentStep === 2 && (
        <>
          <Descriptions title="Payment Summary" bordered column={1}>
            <Descriptions.Item label="Department">
              {form.getFieldValue('department_type')?.toUpperCase()}
            </Descriptions.Item>
            <Descriptions.Item label="Transaction ID">
              {form.getFieldValue('transaction_id')}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              ETB {form.getFieldValue('amount')}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Date">
              {form.getFieldValue('payment_date')?.format('YYYY-MM-DD')}
            </Descriptions.Item>
            {formId && (
              <>
                <Descriptions.Item label="Linked Form">
                  Clearance Form #{formId}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Reason">
                  {rejectionNote}
                </Descriptions.Item>
              </>
            )}
            {form.getFieldValue('note') && (
              <Descriptions.Item label="Reference Note">
                {form.getFieldValue('note')}
              </Descriptions.Item>
            )}
          </Descriptions>
          
          <div style={{ marginTop: 24 }}>
            <Alert
              message="Verification Process"
              description="Your payment will be verified by the department staff. Once verified, your clearance form will be automatically approved and move to the next stage."
              type="info"
              showIcon
            />
          </div>
          
          <Space style={{ marginTop: 24 }}>
            <Button onClick={() => setCurrentStep(1)}>Previous</Button>
            <Button 
              type="primary" 
              loading={submitting} 
              onClick={() => form.submit()}
              disabled={hasExistingPayment}
            >
              {hasExistingPayment ? "Payment Already Verified" : "Submit Payment"}
            </Button>
          </Space>
        </>
      )}
    </Form>
  );

  if (hasExistingPayment && formId && paymentRequired) {
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <Result
          status="success"
          title="Payment Already Verified"
          subTitle={`Your payment for ${requiredDepartment} has been verified and your clearance form has been updated.`}
          extra={[
            <Button type="primary" key="form" onClick={() => navigate(`/student?tab=tracking`)}>
              View Clearance Form Status
            </Button>,
            <Button key="payments" onClick={() => navigate("/student/payments")}>
              View All Payments
            </Button>,
          ]}
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Transaction ID">
              {existingPayment.transaction_id}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              ETB {existingPayment.amount}
            </Descriptions.Item>
            <Descriptions.Item label="Verified At">
              {dayjs(existingPayment.verified_at).format('MMM D, YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Verified By">
              {existingPayment.verified_by || 'Department Staff'}
            </Descriptions.Item>
            <Descriptions.Item label="Form Status">
              <Tag color="green">Updated to next stage</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Result>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {renderFormHeader()}
      
      <Divider />
      
      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <p>Loading payment form...</p>
        </div>
      ) : (
        renderPaymentForm()
      )}
    </div>
  );
}