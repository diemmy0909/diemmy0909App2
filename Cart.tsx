import {
    List,
    Datagrid,
    TextField,
    NumberField,
    Edit,
    SimpleForm,
    FunctionField,
    ArrayField,
    useRecordContext
} from "react-admin";

import {
    Chip,
    Stack,
    Box,
    Typography,
    Paper
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

// ===============================
// 📦 CART LIST
// ===============================
export const CartList = () => (
    <List title="Quản lý Giỏ hàng" sx={{ mt: 2 }}>
        <Datagrid
            rowClick="edit"
            sx={{
                "& .MuiTableCell-head": {
                    fontWeight: "bold",
                    backgroundColor: "#020617",
                    color: "#38bdf8",
                    textTransform: "uppercase",
                    fontSize: "0.75rem"
                },
                "& .MuiTableRow-root:hover": {
                    backgroundColor: "#020617 !important"
                }
            }}
        >
            <TextField source="cartId" label="ID" />
            <TextField source="userEmail" label="Khách hàng" />

            <NumberField
                source="totalPrice"
                label="Tổng tiền"
                options={{ style: "currency", currency: "VND" }}
                sx={{ color: "#22c55e", fontWeight: "bold" }}
            />

            <FunctionField
                label="Sản phẩm"
                render={(record: any) => (
                    <Chip
                        label={`${record.totalItems || 0} sản phẩm`}
                        size="small"
                        sx={{
                            background: "#1e40af",
                            color: "#fff",
                            fontWeight: "bold"
                        }}
                    />
                )}
            />
        </Datagrid>
    </List>
);

// ===============================
// 🛒 CART EDIT
// ===============================
export const CartEdit = () => (
    <Edit title="Chi tiết giỏ hàng">
        <SimpleForm
            sx={{
                maxWidth: "100%",
                px: 2
            }}
        >
            {/* DASHBOARD */}
            <Stack direction="row" spacing={2} mb={3}>
                <StatCard label="Email" valueKey="userEmail" />
                <StatCard label="Tổng SP" valueKey="totalItems" />
                <StatCard label="Tổng tiền" valueKey="totalPrice" money />
            </Stack>

            <Paper sx={{ p: 3, borderRadius: 3 }}>

                <Stack direction="row" spacing={1} mb={2} alignItems="center">
                    <ShoppingCartIcon color="primary" />
                    <Typography fontWeight="bold">Danh sách sản phẩm</Typography>
                </Stack>

                <ArrayField source="products">
                    <Datagrid
                        bulkActionButtons={false}
                        sx={{
                            width: "100%",
                            "& .MuiTableCell-root": { py: 2 }
                        }}
                        rowSx={() => ({
                            transition: ".2s",
                            "&:hover": {
                                background: "#020617",
                                transform: "scale(1.01)"
                            }
                        })}
                    >
                        <ProductPreview />

                        <NumberField
                            source="price"
                            label="Giá"
                            options={{ style: "currency", currency: "VND" }}
                        />

                        <NumberField source="quantity" label="SL" />

                        <FunctionField
                            label="Thành tiền"
                            render={(p: any) =>
                                new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND"
                                }).format((p.price || 0) * (p.quantity || 0))
                            }
                        />
                    </Datagrid>
                </ArrayField>
            </Paper>

            <CartFooter />
        </SimpleForm>
    </Edit>
);

// ===============================
// 🧩 COMPONENTS
// ===============================
const StatCard = ({ label, valueKey, money = false }: any) => {
    const record = useRecordContext();
    let value = record?.[valueKey] ?? "-";

    if (money) {
        value = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(record?.[valueKey] || 0);
    }

    return (
        <Paper
            sx={{
                p: 2,
                flex: 1,
                borderRadius: 3,
                textAlign: "center",
                background: "#020617"
            }}
        >
            <Typography color="#94a3b8">{label}</Typography>
            <Typography fontWeight="bold" fontSize={20}>
                {value}
            </Typography>
        </Paper>
    );
};

// ⭐ FIX LOGIC + UI PRO
const ProductPreview = () => (
    <FunctionField
        label="Sản phẩm"
        render={(p: any) => (
            <Stack direction="row" spacing={2} alignItems="center" sx={{ minHeight: 72 }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid #334155",
                        flexShrink: 0
                    }}
                >
                    <img
                        src={`http://localhost:8080/api/public/products/image/${p.image}`}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                    />
                </Box>

                <Box sx={{ flex: 1 }}>
                    <Typography fontWeight="bold">{p.productName}</Typography>

                    <Stack direction="row" spacing={1} mt={0.5}>
                        {p.stockQuantity === 0 && (
                            <Chip label="Hết hàng" color="error" size="small" />
                        )}

                        {p.stockQuantity > 0 && p.stockQuantity <= 5 && (
                            <Chip
                                label={`Sắp hết (còn ${p.stockQuantity})`}
                                color="warning"
                                size="small"
                            />
                        )}
                    </Stack>
                </Box>
            </Stack>
        )}
    />
);

const CartFooter = () => {
    const record = useRecordContext();

    return (
        <Paper
            sx={{
                position: "sticky",
                bottom: 0,
                mt: 3,
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#020617",
                borderRadius: 2
            }}
        >
            <Typography>Tổng tiền</Typography>
            <Typography fontWeight="bold" fontSize={22} color="#22c55e">
                {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                }).format(record?.totalPrice || 0)}
            </Typography>
        </Paper>
    );
};
