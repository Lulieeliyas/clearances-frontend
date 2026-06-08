import React, { useState, useEffect } from 'react';
import { 
  Upload, Button, Card, Table, message, 
  Modal, Input, Tag, Space, Popconfirm, 
  Select, Statistic, Row, Col, Typography,
  Badge, Tooltip, Progress, Alert
} from 'antd';
import { 
  UploadOutlined, SearchOutlined, ReloadOutlined, 
  DownloadOutlined, DeleteOutlined, UserOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  FileTextOutlined, TeamOutlined, ExportOutlined,
  InfoCircleOutlined, FileExcelOutlined
} from '@ant-design/icons';
import { apiFetch, API_BASE } from '../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;

const CSVManagement = () => {
  const [uploading, setUploading] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [registeredFilter, setRegisteredFilter] = useState('');
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [statistics, setStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);

  // Load statistics
  const loadStatistics = async () => {
    setLoadingStats(true);
    try {
      const data = await apiFetch('admin/csv-statistics/');
      setStatistics(data);
    } catch (err) {
      message.error('Failed to load statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  // Load upload history
  const loadUploadHistory = async () => {
    try {
      const data = await apiFetch('admin/csv-upload-history/');
      setUploadHistory(data || []);
    } catch (err) {
      console.error('Failed to load upload history:', err);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('override_existing', overrideExisting.toString());
    
    setUploading(true);
    try {
      const response = await apiFetch('admin/upload-student-csv/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      message.success(`✅ CSV uploaded successfully! Processed: ${response.details?.processed || 0} records`);
      
      // Show warnings if any
      if (response.details?.errors && response.details.errors.length > 0) {
        Modal.warning({
          title: 'Upload Warnings',
          content: (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <p><strong>{response.details.errors.length} warnings occurred:</strong></p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {response.details.errors.slice(0, 10).map((error, index) => (
                  <li key={index} style={{ color: '#faad14', marginBottom: 5 }}>
                    {error}
                  </li>
                ))}
                {response.details.errors.length > 10 && (
                  <li style={{ color: '#faad14' }}>
                    ... and {response.details.errors.length - 10} more warnings
                  </li>
                )}
              </ul>
            </div>
          ),
          width: 600,
        });
      }
      
      // Show summary
      if (response.details) {
        Modal.info({
          title: 'Upload Summary',
          content: (
            <div>
              <p><strong>Total Records:</strong> {response.details.total_records}</p>
              <p><strong>Successfully Processed:</strong> {response.details.processed}</p>
              <p><strong>New Students Added:</strong> {response.details.added}</p>
              <p><strong>Existing Students Updated:</strong> {response.details.updated}</p>
              <p><strong>Skipped (no changes):</strong> {response.details.skipped}</p>
              {response.details.duplicates && response.details.duplicates.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p><strong>Duplicates Found:</strong> {response.details.duplicates.length}</p>
                  <ul style={{ paddingLeft: 20 }}>
                    {response.details.duplicates.slice(0, 5).map((dup, idx) => (
                      <li key={idx}>{dup}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ),
          width: 500,
        });
      }
      
      loadStudents(1);
      loadStatistics();
      loadUploadHistory();
    } catch (err) {
      message.error(`❌ Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
    
    return false; // Prevent auto upload
  };

  const loadStudents = async (page = 1) => {
    setLoading(true);
    try {
      let url = `admin/valid-students/?page=${page}&page_size=${pagination.pageSize}`;
      
      if (searchText) {
        url += `&search=${encodeURIComponent(searchText)}`;
      }
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      if (registeredFilter !== '') {
        url += `&registered=${registeredFilter}`;
      }
      
      const data = await apiFetch(url);
      
      setStudents(data.students || []);
      setPagination({
        ...pagination,
        current: page,
        total: data.total_count || 0
      });
    } catch (err) {
      message.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (studentId, newStatus) => {
    try {
      await apiFetch(`admin/student-status/${studentId}/`, {
        method: 'POST',
        body: { status: newStatus }
      });
      
      message.success(`Student status updated to ${newStatus}`);
      loadStudents(pagination.current);
      loadStatistics();
    } catch (err) {
      message.error('Failed to update status');
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      await apiFetch(`admin/delete-student-record/${studentId}/`, {
        method: 'DELETE'
      });
      
      message.success('Student record deleted');
      loadStudents(pagination.current);
      loadStatistics();
    } catch (err) {
      message.error('Failed to delete record');
    }
  };

  const downloadTemplate = () => {
    // Create template download
    const csvContent = "first_name,last_name,id_number,college,department,year_of_admission,status\n" +
                      "John,Doe,STU2023001,College of Engineering,Computer Science,2023,active\n" +
                      "Jane,Smith,STU2023002,College of Business,Business Administration,2023,active";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch(`${API_BASE}admin/export-students-csv/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        message.success('CSV export started');
      } else {
        message.error('Failed to export CSV');
      }
    } catch (err) {
      message.error('Export failed');
    }
  };

  const columns = [
    {
      title: 'ID Number',
      dataIndex: 'id_number',
      key: 'id_number',
      width: 120,
      sorter: (a, b) => a.id_number.localeCompare(b.id_number),
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text, record) => (
        <div>
          <div><strong>{text}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.first_name} {record.last_name}
          </div>
        </div>
      ),
    },
    {
      title: 'College',
      dataIndex: 'college',
      key: 'college',
      width: 150,
      filters: students.reduce((acc, curr) => {
        if (!acc.find(item => item.text === curr.college)) {
          acc.push({ text: curr.college, value: curr.college });
        }
        return acc;
      }, []),
      onFilter: (value, record) => record.college === value,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors = {
          'active': 'green',
          'inactive': 'red',
          'graduated': 'blue',
          'suspended': 'orange'
        };
        return (
          <Tag color={colors[status] || 'default'}>
            {status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        );
      },
    },
    {
      title: 'Registered',
      dataIndex: 'is_registered',
      key: 'is_registered',
      width: 100,
      render: (registered, record) => (
        <div>
          <Tag color={registered ? 'blue' : 'orange'}>
            {registered ? (
              <span>
                <CheckCircleOutlined /> Yes
              </span>
            ) : (
              <span>
                <CloseCircleOutlined /> No
              </span>
            )}
          </Tag>
          {registered && record.registered_at && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
              {new Date(record.registered_at).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          {record.status === 'active' ? (
            <Popconfirm
              title="Deactivate this student?"
              onConfirm={() => toggleStatus(record.id, 'inactive')}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" danger>Deactivate</Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Activate this student?"
              onConfirm={() => toggleStatus(record.id, 'active')}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" type="primary">Activate</Button>
            </Popconfirm>
          )}
          {!record.is_registered && (
            <Popconfirm
              title="Delete this student record?"
              onConfirm={() => deleteStudent(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okType="danger"
            >
              <Button size="small" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    loadStudents(1);
    loadStatistics();
    loadUploadHistory();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ marginBottom: '20px' }}>
        <FileExcelOutlined /> Student CSV Management
      </Title>
      
      {/* Statistics Card */}
      <Card style={{ marginBottom: '20px', borderRadius: 8 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Total Records"
              value={statistics?.total_records || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ fontSize: '24px' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Active Students"
              value={statistics?.active_records || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Registered"
              value={statistics?.registered_records || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Registration Rate"
              value={statistics?.registration_rate || 0}
              suffix="%"
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
            />
            <Progress 
              percent={statistics?.registration_rate || 0} 
              size="small" 
              status="active"
              strokeColor="#722ed1"
            />
          </Col>
        </Row>
      </Card>

      {/* Upload Card */}
      <Card 
        title="Upload Student Records" 
        style={{ marginBottom: '20px', borderRadius: 8 }}
        extra={
          <Tooltip title="Download CSV Template">
            <Button 
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
              style={{ marginRight: 8 }}
            >
              Template
            </Button>
          </Tooltip>
        }
      >
        <Row gutter={[16, 16]} align="middle">
          <Col span={24}>
            <Alert
              message="CSV Upload Instructions"
              description={
                <div>
                  <p><strong>Required columns:</strong> first_name, last_name, id_number, college, department</p>
                  <p><strong>Optional columns:</strong> year_of_admission, status (active/inactive/graduated)</p>
                  <p><strong>Status defaults to "active" if not specified</strong></p>
                </div>
              }
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 16 }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Upload
              beforeUpload={handleUpload}
              showUploadList={false}
              accept=".csv"
              maxCount={1}
            >
              <Button 
                type="primary" 
                icon={<UploadOutlined />}
                loading={uploading}
                size="large"
                block
              >
                {uploading ? 'Uploading...' : 'Upload CSV File'}
              </Button>
            </Upload>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Text strong>Options:</Text>
              <Select
                value={overrideExisting}
                onChange={setOverrideExisting}
                style={{ width: 200 }}
              >
                <Option value={false}>Skip existing students</Option>
                <Option value={true}>Override existing students</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>
      
      {/* Student Records Table */}
      <Card 
        title="Student Records" 
        extra={
          <Space>
            <Button 
              icon={<ExportOutlined />}
              onClick={exportToCSV}
            >
              Export CSV
            </Button>
            <Button 
              type="default" 
              icon={<ReloadOutlined />} 
              onClick={() => {
                loadStudents(1);
                loadStatistics();
                loadUploadHistory();
              }}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
        style={{ marginBottom: '20px', borderRadius: 8 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Input
              placeholder="Search by name, ID, department..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              onPressEnter={() => loadStudents(1)}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              style={{ width: 120 }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="graduated">Graduated</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
            <Select
              placeholder="Filter by registration"
              style={{ width: 140 }}
              value={registeredFilter}
              onChange={setRegisteredFilter}
              allowClear
            >
              <Option value="true">Registered</Option>
              <Option value="false">Not Registered</Option>
            </Select>
            <Button 
              type="primary"
              onClick={() => loadStudents(1)}
            >
              Apply Filters
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} students`,
            onChange: (page) => loadStudents(page),
            onShowSizeChange: (current, size) => {
              setPagination({...pagination, pageSize: size});
              loadStudents(1);
            }
          }}
          scroll={{ x: 1000 }}
          bordered
        />
      </Card>
      
      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <Card 
          title="Recent Uploads" 
          style={{ marginBottom: '20px', borderRadius: 8 }}
        >
          <Table
            dataSource={uploadHistory.slice(0, 5)}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'File Name',
                dataIndex: 'file_name',
                key: 'file_name',
                render: (text) => (
                  <Text strong style={{ color: '#1890ff' }}>
                    {text}
                  </Text>
                ),
              },
              {
                title: 'Uploaded At',
                dataIndex: 'uploaded_at',
                key: 'uploaded_at',
                render: (date) => new Date(date).toLocaleString(),
              },
              {
                title: 'Records',
                dataIndex: 'records_processed',
                key: 'records_processed',
                render: (count) => (
                  <Tag color="blue">{count} records</Tag>
                ),
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={status === 'success' ? 'success' : 'error'}>
                    {status?.toUpperCase()}
                  </Tag>
                ),
              },
            ]}
          />
        </Card>
      )}
      
      {/* Instructions Card */}
      <Card title="CSV Format Instructions" style={{ borderRadius: 8 }}>
        <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
          <Text>
            <p><strong>Required columns (in order):</strong></p>
            <ul style={{ marginBottom: 16 }}>
              <li><code>first_name</code> - Student's first name</li>
              <li><code>last_name</code> - Student's last name</li>
              <li><code>id_number</code> - Student ID (unique)</li>
              <li><code>college</code> - College name</li>
              <li><code>department</code> - Department name</li>
            </ul>
            
            <p><strong>Optional columns:</strong></p>
            <ul style={{ marginBottom: 16 }}>
              <li><code>year_of_admission</code> - Year student was admitted (e.g., 2023)</li>
              <li><code>status</code> - Must be one of: active, inactive, graduated, suspended</li>
            </ul>
            
            <p><strong>Example CSV content:</strong></p>
            <pre style={{ 
              background: '#fff', 
              padding: '12px', 
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              overflowX: 'auto'
            }}>
              first_name,last_name,id_number,college,department,year_of_admission,status<br/>
              John,Doe,STU2023001,College of Engineering,Computer Science,2023,active<br/>
              Jane,Smith,STU2023002,College of Business,Business Administration,2023,active<br/>
              Michael,Johnson,STU2023003,College of Science,Physics,2022,graduated<br/>
              Sarah,Williams,STU2023004,College of Medicine,Medicine,2023,inactive
            </pre>
            
            <Alert
              message="Important Notes"
              description={
                <ul style={{ margin: 0 }}>
                  <li>ID numbers must be unique across the system</li>
                  <li>College and department names should match existing records</li>
                  <li>Files must be in UTF-8 encoding</li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              }
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default CSVManagement;