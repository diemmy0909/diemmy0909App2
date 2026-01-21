import { 
    List, 
    Datagrid, 
    TextField, 
    EmailField, 
    DeleteButton, 
    ChipField, 
    ArrayField, 
    SingleFieldList,
    useRecordContext
} from "react-admin";
import { Box, Typography, Stack, Avatar } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';

// --- Component hiển thị Tên đầy đủ kèm Avatar ---
const FullNameField = () => {
    const record = useRecordContext();
    if (!record) return null;

    // Kiểm tra an toàn để tránh lỗi đỏ khi roles chưa tải xong hoặc undefined
    const roles = Array.isArray(record.roles) ? record.roles : [];
    const isAdmin = roles.some((role: any) => role.roleName === 'ADMIN');

    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
                sx={{ 
                    width: 35, 
                    height: 35, 
                    bgcolor: isAdmin ? 'rgba(144, 202, 249, 0.1)' : 'rgba(76, 175, 80, 0.1)', 
                    color: isAdmin ? '#90caf9' : '#66bb6a',
                    border: isAdmin ? '1px solid rgba(144, 202, 249, 0.3)' : '1px solid rgba(76, 175, 80, 0.3)'
                }}
            >
                <PersonIcon fontSize="small" />
            </Avatar>
            <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }}>
                    {record.firstName} {record.lastName}
                </Typography>
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: isAdmin ? '#90caf9' : '#66bb6a', 
                        fontWeight: isAdmin ? 'bold' : 'normal',
                        display: 'block' 
                    }}
                >
                    {isAdmin ? 'Thành viên hệ thống' : 'Khách hàng'}
                </Typography>
            </Box>
        </Stack>
    );
};

// --- Tùy chỉnh Chip Role ---
const CustomRoleChip = (props: any) => (
    <ChipField 
        {...props} 
        sx={{ 
            fontWeight: '600', 
            borderRadius: '4px',
            textTransform: 'uppercase',
            fontSize: '10px',
            letterSpacing: '0.5px',
            px: 0.5
        }} 
        color="secondary"
        variant="outlined"
    />
);

export const UserList = () => (
    <List title="Quản lý người dùng" sx={{ mt: 2 }}>
        <Datagrid 
            rowClick="show"
            sx={{
                '& .RaDatagrid-headerCell': {
                    fontWeight: 'bold',
                    backgroundColor: '#1e1e1e',
                    color: '#90caf9',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    padding: '16px'
                },
                '& .MuiTableRow-root:hover': {
                    backgroundColor: '#2c2c2c !important',
                },
                '& .MuiTableCell-root': {
                    padding: '12px 16px',
                    borderBottom: '1px solid #333'
                },
                boxShadow: '0px 4px 20px rgba(0,0,0,0.4)',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#1a1a1a'
            }}
        >
            <TextField source="userId" label="Mã ID" sx={{ color: '#aaa', fontFamily: 'monospace' }} />
            
            <FullNameField label="Họ và Tên" />

            <EmailField source="email" label="Địa chỉ Email" sx={{ color: '#90caf9' }} />
            
            <TextField source="mobileNumber" label="Số điện thoại" sx={{ color: '#eee' }} />
            
            <ArrayField source="roles" label="Quyền hạn">
                <SingleFieldList linkType={false}>
                    <CustomRoleChip source="roleName" />
                </SingleFieldList>
            </ArrayField>
            
            <Box label="Thao tác">
                {/* Sửa lỗi confirmTitle/confirmContent bằng cách xóa chúng đi vì DeleteButton mặc định đã có hộp thoại xác nhận */}
                <DeleteButton 
                    label="Gỡ bỏ" 
                    sx={{ 
                        color: '#ff5252',
                        '&:hover': { backgroundColor: 'rgba(255, 82, 82, 0.1)' }
                    }}
                />
            </Box>
        </Datagrid>
    </List>
);