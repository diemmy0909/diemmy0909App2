import { List, Datagrid, TextField, NumberField, DateField, EmailField, Edit, SimpleForm, SelectInput, TextInput, EditButton, FunctionField } from "react-admin";
import { Chip, Stack, Box, Typography, Paper } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const statusChoices = [
    { id: 'Order Accepted!', name: 'Chờ xác nhận', color: '#ff9800' },
    { id: 'Pending', name: 'Chờ lấy hàng', color: '#2196f3' },
    { id: 'Shipped', name: 'Đang giao', color: '#00bcd4' },
    { id: 'Delivered', name: 'Đã giao hàng', color: '#4caf50' },
    { id: 'Cancelled', name: 'Đã hủy', color: '#f44336' },
];

export const OrderList = () => (
    <List title="Quản lý đơn hàng" sx={{ mt: 2 }}>
        <Datagrid rowClick="edit" sx={{
            '& .MuiTableCell-head': {
                fontWeight: 'bold',
                backgroundColor: '#1e1e1e', // Nền tối giống Category
                color: '#90caf9',
                textTransform: 'uppercase',
                fontSize: '0.75rem'
            },
            '& .MuiTableRow-root:hover': { backgroundColor: '#2c2c2c !important' }
        }}>
            <TextField source="orderId" label="Mã Đơn" sx={{ fontWeight: 'bold', color: '#90caf9' }} />
            <EmailField source="email" label="Khách hàng" />
            <NumberField
                source="totalAmount"
                label="Tổng tiền"
                options={{ style: 'currency', currency: 'VND' }}
                sx={{ color: '#ee4d2d', fontWeight: 'bold', fontSize: '1rem' }}
            />
            <DateField source="orderDate" label="Ngày đặt" locales="vi-VN" showTime />
            <FunctionField label="Trạng thái" render={(record: any) => {
                const status = statusChoices.find(s => s.id === record.orderStatus) || { name: record.orderStatus, color: '#9e9e9e' };
                return <Chip label={status.name} size="small" sx={{ backgroundColor: status.color, color: '#fff', borderRadius: '4px', fontWeight: 'bold' }} />;
            }} />
            <EditButton label="Cập nhật" variant="outlined" size="small" />
        </Datagrid>
    </List>
);

export const OrderEdit = () => (
    <Edit title="Cập nhật Đơn hàng">
        <SimpleForm sx={{ maxWidth: 600 }}>
            <Paper sx={{ p: 2, width: '100%', bgcolor: 'transparent' }} elevation={0}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                    <ReceiptLongIcon color="primary" sx={{ fontSize: 30 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Xử lý trạng thái đơn hàng</Typography>
                </Stack>
                <Box display="flex" gap={2} mb={2}>
                    <TextInput source="orderId" label="Mã đơn" disabled sx={{ flex: 1 }} variant="filled" />
                    <TextInput source="email" label="Email khách" disabled sx={{ flex: 2 }} variant="filled" />
                </Box>
                <SelectInput
                    source="orderStatus"
                    label="Cập nhật trạng thái mới"
                    choices={statusChoices.map(s => ({ id: s.id, name: s.name }))}
                    fullWidth
                    variant="filled"
                />
            </Paper>
        </SimpleForm>
    </Edit>
);