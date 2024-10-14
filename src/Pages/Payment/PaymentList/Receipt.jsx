import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const Receipt = ({ receipt }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const showModal = () => {
        setModalVisible(true);
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    return (
        <div>
            <Button 
                type="text" 
                size='medium'
                icon={<EyeOutlined />} 
                onClick={showModal}
            />
            <Modal 
                title="Receipt Image" 
                visible={modalVisible} 
                footer={null} 
                onCancel={handleCancel}
                centered
            >
                <div className='divider mt-1'></div>
                <img 
                    src={receipt} 
                    alt="Receipt" 
                    style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }} 
                />
            </Modal>
        </div>
    );
};

export default Receipt;