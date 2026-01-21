import { 
    List, 
    useRecordContext, 
    Datagrid, 
    TextField, 
    NumberField, 
    Create, 
    Edit, 
    SimpleForm, 
    TextInput, 
    NumberInput, 
    ReferenceInput, 
    SelectInput, 
    EditButton, 
    DeleteButton,
    required,
    ImageInput,
    ImageField
} from 'react-admin';

import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Stack, Divider, Chip, Paper } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';

// ====================================================
// 1️⃣ Custom Image Field
// ====================================================
const CustomImageField = ({ source }: { source: string }) => {
    const record = useRecordContext();

    if (!record || !record[source]) {
        return <Typography variant="caption" color="text.secondary">Không có ảnh</Typography>;
    }

    let imageUrl = record[source];
    if (!imageUrl.startsWith('http')) {
        imageUrl = `http://localhost:8080/api/public/products/image/${imageUrl}`;
    }

    return (
        <RouterLink to={`/products/${record.id}/update-image`} style={{ textDecoration: 'none' }}>
            <Box
                component="img"
                src={imageUrl}
                sx={{
                    width: 56,
                    height: 56,
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid #444',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': { 
                        transform: 'scale(1.15)', 
                        boxShadow: '0px 4px 12px rgba(0,0,0,0.5)',
                        borderColor: '#90caf9'
                    }
                }}
                onError={(e: any) => {
                    e.currentTarget.src =
                        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkAQMAAABKLAcXAAAAA1BMVEXt7e1X/3DEAAAAR0lEQVQ4y2NgGAWjYBSMglEwCkbBSBhQwH+go+B/8P/wf/D/8H/w//D/8H/w//D/8H/w//D/8H/w//D/8H/w//D/8H/w//D/8P/w/9DQAAAAAP//y9k8vQAAAABJRU5ErkJggg==";
                }}
            />
        </RouterLink>
    );
};

// ====================================================
// 2️⃣ Short Description
// ====================================================
const ShortDescriptionField = ({ source }: { source: string }) => {
    const record = useRecordContext();
    if (!record || !record[source]) return null;

    return (
        <Typography
            variant="body2"
            sx={{
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#aaa',
                fontStyle: 'italic'
            }}
        >
            {record[source]}
        </Typography>
    );
};

// ====================================================
// 3️⃣ Discount Chip
// ====================================================
const DiscountField = ({ source }: { source: string }) => {
    const record = useRecordContext();
    if (!record || !record[source]) return <span style={{ color: '#666' }}>0%</span>;

    return (
        <Chip
            label={`-${record[source]}%`}
            size="small"
            color="error"
            sx={{ fontWeight: 'bold', borderRadius: '4px' }}
        />
    );
};

// ====================================================
// 4️⃣ Product List
// ====================================================
export const ProductList = () => (
    <List
        title="Quản lý thực đơn"
        sx={{ mt: 2 }}
        filters={[
            <TextInput source="search" label="Tìm kiếm tên..." alwaysOn size="small" key="search" variant="outlined" />,
            <ReferenceInput source="categoryId" reference="categories" label="Danh mục" key="category">
                <SelectInput optionText="categoryName" size="small" />
            </ReferenceInput>
        ]}
    >
        <Datagrid
            rowClick={false}
            sx={{ 
                '& .RaDatagrid-headerCell': { 
                    fontWeight: 'bold', 
                    backgroundColor: '#1e1e1e',
                    color: '#90caf9',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                },
                '& .MuiTableRow-root:hover': { backgroundColor: '#2c2c2c !important' }
            }}
        >
            <TextField source="productId" label="ID" sx={{ color: '#aaa' }} />

            <Stack direction="row" spacing={2} alignItems="center" label="Sản phẩm">
                <CustomImageField source="image" />
                <TextField source="productName" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }} />
            </Stack>

            <TextField source="category.categoryName" label="Danh mục" />
            <ShortDescriptionField source="description" label="Mô tả" />
            <NumberField source="quantity" label="Kho" />
            <NumberField source="price" label="Giá gốc" options={{ style: 'currency', currency: 'VND' }} />
            <DiscountField source="discount" label="Giảm" />
            <NumberField
                source="specialPrice"
                label="Giá ưu đãi"
                options={{ style: 'currency', currency: 'VND' }}
                sx={{ fontWeight: 'bold', color: '#66bb6a', fontSize: '1rem' }}
            />

            <Stack direction="row" spacing={1} label="Thao tác">
                <EditButton label="Sửa" variant="outlined" size="small" />
                <DeleteButton label="Xóa" size="small" />
            </Stack>
        </Datagrid>
    </List>
);

// ====================================================
// 5️⃣ Product Create
// ====================================================
export const ProductCreate = () => (
    <Create title="Thêm món mới">
        <SimpleForm sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>Thông tin cơ bản</Typography>

            <Box display="flex" gap={3} width="100%">
                <Box flex={2}>
                    <TextInput source="productName" label="Tên món ăn" fullWidth validate={required()} variant="filled" />
                    <TextInput source="description" label="Mô tả chi tiết" fullWidth multiline rows={3} variant="filled" />
                </Box>

                <Box flex={1} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid #444' }}>
                    <ReferenceInput source="categoryId" reference="categories" label="Danh mục">
                        <SelectInput optionText="categoryName" fullWidth validate={required()} />
                    </ReferenceInput>

                    <Box mt={3}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#90caf9' }}>Ảnh sản phẩm</Typography>
                        <ImageInput source="imageFile" label="Chọn ảnh hoặc kéo thả" accept="image/*">
                            <ImageField source="src" title="title" />
                        </ImageInput>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ my: 3, width: '100%' }} />

            <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>Giá & Kho hàng</Typography>
            <Box display="flex" gap={2} width="100%">
                <NumberInput source="quantity" label="Số lượng tồn" validate={required()} min={0} sx={{ flex: 1 }} />
                <NumberInput source="price" label="Giá bán (VND)" validate={required()} min={0} sx={{ flex: 1 }} />
                <NumberInput source="discount" label="Giảm giá (%)" defaultValue={0} min={0} max={100} sx={{ flex: 1 }} />
            </Box>
        </SimpleForm>
    </Create>
);

// ====================================================
// 6️⃣ Product Edit
// ====================================================
export const ProductEdit = () => (
    <Edit title="Cập nhật món ăn">
        <SimpleForm sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <InventoryIcon color="primary" sx={{ fontSize: 30 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Chỉnh sửa thực đơn</Typography>
            </Stack>

            <Box display="flex" gap={2} mt={2} width="100%">
                <TextInput source="productId" label="ID" disabled sx={{ width: 120 }} variant="filled" />
                <TextInput source="productName" label="Tên món ăn" fullWidth validate={required()} variant="filled" />
            </Box>

            <TextInput source="description" label="Mô tả chi tiết" fullWidth multiline rows={3} sx={{ mt: 2 }} variant="filled" />

            <Box display="flex" gap={2} mt={2} width="100%">
                <NumberInput source="price" label="Giá bán (VND)" validate={required()} sx={{ flex: 1 }} />
                <NumberInput source="quantity" label="Tồn kho" validate={required()} sx={{ flex: 1 }} />
                <NumberInput source="discount" label="Giảm (%)" sx={{ flex: 1 }} />
            </Box>

            <Divider sx={{ my: 4, width: '100%' }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#90caf9', mb: 2 }}>Thay đổi hình ảnh</Typography>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px dashed #666', width: '100%' }}>
                <ImageInput source="imageFile" label="Tải ảnh mới" accept="image/*">
                    <ImageField source="src" title="title" />
                </ImageInput>
            </Box>
        </SimpleForm>
    </Edit>
);