import {
    List,
    Datagrid,
    TextField,
    Create,
    Edit,
    SimpleForm,
    TextInput,
    EditButton,
    DeleteButton,
    required,
    ImageField, 
    ImageInput 
} from "react-admin";

import { Box, Typography, Stack, Divider, Paper } from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import LabelIcon from '@mui/icons-material/Label';
import ImageIcon from '@mui/icons-material/Image';

// ======= 1. Danh sách danh mục (List) =======
export const CategoryList = () => (
    <List title="Quản lý danh mục" sx={{ mt: 2 }}>
        <Datagrid
            rowClick={false}
            sx={{
                '& .RaDatagrid-headerCell': {
                    fontWeight: 'bold',
                    backgroundColor: '#1e1e1e',
                    color: '#90caf9', 
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em'
                },
                '& .MuiTableRow-root:hover': {
                    backgroundColor: '#2c2c2c !important',
                },
                border: 'none',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.3)',
                borderRadius: '8px',
                overflow: 'hidden'
            }}
        >
            <TextField source="categoryId" label="Mã ID" sx={{ color: '#aaa' }} />

            {/* [SỬA] Dùng imageUrl để hiển thị ảnh full link */}
            <ImageField 
                source="imageUrl" 
                label="Hình ảnh"
                sx={{ 
                    '& img': { 
                        maxWidth: 50, 
                        maxHeight: 50, 
                        objectFit: 'cover', 
                        borderRadius: '4px',
                        border: '1px solid #444'
                    } 
                }} 
            />

            <Box label="Tên danh mục">
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box 
                        sx={{ 
                            backgroundColor: 'rgba(144, 202, 249, 0.1)', 
                            borderRadius: '50%', 
                            p: 0.8, 
                            display: 'flex' 
                        }}
                    >
                        <CategoryIcon sx={{ fontSize: 20, color: '#90caf9' }} />
                    </Box>
                    <TextField source="categoryName" sx={{ fontWeight: '600', fontSize: '0.95rem' }} />
                </Stack>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end" label="Thao tác">
                <EditButton 
                    label="Sửa" 
                    variant="outlined" 
                    size="small" 
                    sx={{ borderRadius: '4px' }}
                />
                <DeleteButton 
                    label="Xóa" 
                    size="small"
                    sx={{ borderRadius: '4px', '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' } }}
                />
            </Stack>
        </Datagrid>
    </List>
);

// ======= 2. Form thêm danh mục (Create) =======
export const CategoryCreate = () => (
    <Create title="Thêm danh mục mới">
        <SimpleForm sx={{ maxWidth: '600px' }}>
            <Paper sx={{ p: 3, width: '100%', bgcolor: 'transparent' }} elevation={0}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <CategoryIcon sx={{ color: '#90caf9', fontSize: 30 }} />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Thông tin danh mục</Typography>
                        <Typography variant="caption" color="textSecondary">Vui lòng nhập tên và chọn ảnh cho danh mục mới</Typography>
                    </Box>
                </Stack>
                
                <Divider sx={{ mb: 3 }} />

                <TextInput
                    source="categoryName"
                    label="Tên danh mục mới"
                    fullWidth
                    variant="filled"
                    validate={required('Vui lòng không để trống')}
                    InputProps={{
                        startAdornment: <LabelIcon sx={{ color: '#666', mr: 1 }} />,
                    }}
                    sx={{ mb: 2 }}
                />

                <Box sx={{ mt: 2, border: '1px dashed #555', borderRadius: 2, p: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <ImageIcon sx={{ color: '#90caf9' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Hình ảnh đại diện</Typography>
                    </Stack>
                    <ImageInput 
                        source="image" 
                        label="Chọn ảnh (hoặc thả vào đây)" 
                        accept="image/*"
                        placeholder={<p>Kéo thả ảnh vào đây hoặc click để chọn</p>}
                    >
                        <ImageField source="src" title="title" />
                    </ImageInput>
                </Box>

            </Paper>
        </SimpleForm>
    </Create>
);

// ======= 3. Form chỉnh sửa danh mục (Edit) =======
export const CategoryEdit = () => (
    <Edit title="Cập nhật danh mục">
        <SimpleForm sx={{ maxWidth: '600px' }}>
            <Paper sx={{ p: 3, width: '100%', bgcolor: 'transparent' }} elevation={0}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <CategoryIcon sx={{ color: '#ffa726', fontSize: 30 }} />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Chỉnh sửa danh mục</Typography>
                        <Typography variant="caption" color="textSecondary">Thay đổi thông tin cho danh mục hiện có</Typography>
                    </Box>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Box display="flex" gap={2} alignItems="flex-start" sx={{ mb: 2 }}>
                    <TextInput 
                        source="categoryId" 
                        label="ID" 
                        disabled 
                        variant="filled"
                        sx={{ width: '120px', '& .MuiInputBase-input': { fontWeight: 'bold' } }} 
                    />
                    <TextInput
                        source="categoryName"
                        label="Tên danh mục"
                        fullWidth
                        variant="filled"
                        validate={required('Vui lòng không để trống')}
                        InputProps={{
                            startAdornment: <LabelIcon sx={{ color: '#666', mr: 1 }} />,
                        }}
                    />
                </Box>

                <Box sx={{ mt: 2, border: '1px dashed #555', borderRadius: 2, p: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <ImageIcon sx={{ color: '#ffa726' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Cập nhật hình ảnh</Typography>
                    </Stack>
                    
                    {/* [SỬA] Hiển thị ảnh cũ từ imageUrl */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>Ảnh hiện tại:</Typography>
                        <ImageField 
                            source="imageUrl" 
                            title="Ảnh cũ" 
                            sx={{ '& img': { maxWidth: 200, maxHeight: 200, borderRadius: 4, border: '1px solid #444' } }} 
                        />
                    </Box>

                    <ImageInput 
                        source="image" 
                        label="Chọn ảnh mới để thay thế" 
                        accept="image/*"
                        placeholder={<p>Kéo thả ảnh mới vào đây để thay đổi</p>}
                    >
                        <ImageField source="src" title="title" />
                    </ImageInput>
                </Box>

            </Paper>
        </SimpleForm>
    </Edit>
);