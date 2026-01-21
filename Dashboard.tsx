import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Stack,
  Container,
  Paper,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
  Alert,
  Fade
} from "@mui/material";
import { blue, green, purple, grey } from "@mui/material/colors";
import { useRefresh, useNotify } from "react-admin";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShieldIcon from "@mui/icons-material/VerifiedUser";
import LogoutIcon from "@mui/icons-material/Logout";

import { dataProvider } from "../dataProvider";
import { authProvider } from "../authProvider";

/* ===================== STYLES ===================== */

const cardStyle = {
  bgcolor: "#1f1f1f",
  borderRadius: 4,
  border: "1px solid #2a2a2a"
};

const statCardStyle = {
  ...cardStyle,
  height: 120,
  transition: "0.25s",
  "&:hover": {
    transform: "translateY(-4px)"
  }
};

/* ===================== MAIN ===================== */

export const Dashboard = () => {
  const refresh = useRefresh();
  const notify = useNotify();

  const [loading, setLoading] = useState(true);
  const [openToast, setOpenToast] = useState(false);

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    recentOrders: [],
    chartData: []
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [users, products, orders] = await Promise.all([
        dataProvider.getList("users", {
          pagination: { page: 1, perPage: 1 },
          sort: { field: "userId", order: "ASC" }
        }),
        dataProvider.getList("products", {
          pagination: { page: 1, perPage: 1 },
          sort: { field: "productId", order: "ASC" }
        }),
        dataProvider.getList("orders", {
          pagination: { page: 1, perPage: 5 },
          sort: { field: "orderId", order: "DESC" }
        })
      ]);

      setStats({
        users: users.total || 0,
        products: products.total || 0,
        orders: orders.total || 0,
        recentOrders: orders.data || [],
        chartData: [
          { label: "T2", val: 40 },
          { label: "T3", val: 65 },
          { label: "T4", val: 55 },
          { label: "T5", val: 90 },
          { label: "T6", val: 70 },
          { label: "T7", val: 35 },
          { label: "CN", val: 80 }
        ]
      });

      setOpenToast(true);
    } catch (e) {
      notify("Không tải được dữ liệu dashboard", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadData();
  }, [loadData, refresh]);

  const handleLogout = async () => {
    await authProvider.logout();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <Box minHeight="80vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress size={56} sx={{ color: blue[500] }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Snackbar open={openToast} autoHideDuration={2500} onClose={() => setOpenToast(false)}>
        <Alert severity="success" variant="filled">
          Dashboard đã cập nhật dữ liệu
        </Alert>
      </Snackbar>

      <Fade in timeout={600}>
        <Grid container spacing={3}>

          {/* ================= STAT CARDS ================= */}
          <Grid item xs={12} md={4}>
            <StatCard
              title="Người dùng"
              value={stats.users}
              color={blue[500]}
              icon={<PeopleIcon />}
              trend="+12%"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <StatCard
              title="Sản phẩm"
              value={stats.products}
              color={purple[400]}
              icon={<InventoryIcon />}
              trend="+5%"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <StatCard
              title="Đơn hàng"
              value={stats.orders}
              color={green[500]}
              icon={<ShoppingBagIcon />}
              trend="+18%"
            />
          </Grid>

          {/* ================= CHART ================= */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ ...cardStyle, height: 380 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={800} color="white">
                    Phân tích tuần
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={loadData}
                    sx={{ bgcolor: blue[700], borderRadius: 2 }}
                  >
                    Làm mới
                  </Button>
                </Stack>

                <Box
                  sx={{
                    mt: 4,
                    height: 240,
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 2,
                    px: 2
                  }}
                >
                  {stats.chartData.map((d, i) => (
                    <Tooltip key={i} title={`${d.val}%`} arrow>
                      <Box
                        sx={{
                          flex: 1,
                          height: `${Math.min(d.val, 100)}%`,
                          bgcolor: blue[600],
                          borderRadius: "6px 6px 0 0",
                          transition: "0.3s",
                          "&:hover": { bgcolor: blue[400] }
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ================= RECENT ORDERS ================= */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ ...cardStyle, height: 380 }}>
              <CardContent>
                <Typography fontWeight={800} color="white" mb={2}>
                  Đơn hàng mới
                </Typography>

                <List dense>
                  {stats.recentOrders.map((o) => (
                    <ListItem key={o.orderId} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "#2c2c2c", color: green[400] }}>
                          <ReceiptLongIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Đơn #${o.orderId}`}
                        secondary={`${o.totalAmount?.toLocaleString()}đ`}
                        primaryTypographyProps={{ color: "white", fontSize: 13 }}
                        secondaryTypographyProps={{ color: grey[500], fontSize: 12 }}
                      />
                      <Chip
                        label={o.status}
                        size="small"
                        sx={{
                          bgcolor: blue[900],
                          color: blue[100],
                          fontSize: 10
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* ================= ADMIN ================= */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: blue[900],
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: blue[700] }}>
                  <ShieldIcon />
                </Avatar>
                <Typography color="white" fontWeight={700}>
                  Admin Master
                </Typography>
              </Stack>

              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
              >
                Đăng xuất
              </Button>
            </Paper>
          </Grid>

        </Grid>
      </Fade>
    </Container>
  );
};

/* ===================== COMPONENTS ===================== */

const StatCard = ({ title, value, icon, color, trend }) => (
  <Paper sx={{ ...statCardStyle, borderColor: color }}>
    <Stack direction="row" spacing={2} alignItems="center" height="100%">
      <Avatar
        sx={{
          bgcolor: `${color}22`,
          color,
          width: 56,
          height: 56
        }}
      >
        {icon}
      </Avatar>

      <Box>
        <Typography variant="h4" fontWeight={900} color="white">
          {value.toLocaleString()}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={13} color={grey[500]} fontWeight={600}>
            {title}
          </Typography>
          <Chip
            label={trend}
            size="small"
            icon={<TrendingUpIcon sx={{ fontSize: 12 }} />}
            sx={{
              bgcolor: green[900],
              color: green[200],
              fontSize: 10,
              height: 18
            }}
          />
        </Stack>
      </Box>
    </Stack>
  </Paper>
);
