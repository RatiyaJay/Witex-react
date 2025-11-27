/**
=========================================================
* Argon Dashboard 2 MUI - v3.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-material-ui
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Soft UI Dashboard React are added here,
  You can add a new route, customize the routes and delete the routes here.
  Once you add a new route on this file it will be visible automatically on
  the Sidenav.
  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Argon Dashboard 2 MUI layouts
import Dashboard from "layouts/dashboard";
import Home from "layouts/home";
// Custom pages
import MachineManagement from "layouts/machine-management";
import ManageFirm from "layouts/manage-firm";
import EditFirm from "layouts/manage-firm/edit";
import YarnManagement from "layouts/yarn-management";
import Twisting from "layouts/twisting";
import BeamFlow from "layouts/beam-flow";
import MendingHub from "layouts/mending-hub";
import SortageAnalysis from "layouts/sortage-analysis";
import OperationalReport from "layouts/operational-report";
import PerformancePulse from "layouts/performance-pulse";
import StoppageDetails from "layouts/stoppage-details";
import CurrentFlow from "layouts/current-flow";
import Calculator from "layouts/calculator";
import Reports from "layouts/reports";
import ActivityLogs from "layouts/activity-logs";
import QualityStock from "layouts/quality-stock";
// Orderbook section
import OrderbookFabric from "layouts/orderbook/fabric";
import OrderbookYarn from "layouts/orderbook/yarn";
import EditProfile from "layouts/edit-profile";
// Settings section
import SettingsProduction from "layouts/settings/production";
import SettingsUser from "layouts/settings/user";
import SettingsGroup from "layouts/settings/group";
import SettingsShift from "layouts/settings/shift";
// Misc
import Feedback from "layouts/feedback";
import PrivacyPolicy from "layouts/privacy-policy";
import ContactUs from "layouts/contact-us";
import Logout from "layouts/logout";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";

const routes = [
  {
    type: "route",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <Dashboard />,
  },
  {
    type: "route",
    name: "Home",
    key: "home",
    route: "/home",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="ni ni-building" />,
    component: <Home />,
  },
  { type: "title", title: "Operations", key: "operations-title" },
  { type: "route", name: "Machine Management", key: "machine-management", route: "/machine-management", icon: "build", component: <MachineManagement /> },
  { type: "route", name: "Manage Firm", key: "manage-firm", route: "/manage-firm", icon: "business", component: <ManageFirm /> },
  // Hidden routes for add/edit firm pages (not shown in sidenav)
  { type: "hidden", key: "manage-firm-edit", route: "/manage-firm/edit/:id", component: <EditFirm /> },
  { type: "hidden", key: "manage-firm-new", route: "/manage-firm/new", component: <EditFirm /> },
  { type: "route", name: "Yarn Management", key: "yarn-management", route: "/yarn-management", icon: "inventory", component: <YarnManagement /> },
  { type: "route", name: "Twisting", key: "twisting", route: "/twisting", icon: "cached", component: <Twisting /> },
  { type: "route", name: "Beam Flow", key: "beam-flow", route: "/beam-flow", icon: "device_hub", component: <BeamFlow /> },
  { type: "route", name: "Mending Hub", key: "mending-hub", route: "/mending-hub", icon: "handyman", component: <MendingHub /> },
  { type: "route", name: "Sortage Analysis", key: "sortage-analysis", route: "/sortage-analysis", icon: "analytics", component: <SortageAnalysis /> },
  { type: "route", name: "Operational Report", key: "operational-report", route: "/operational-report", icon: "assignment", component: <OperationalReport /> },
  { type: "route", name: "Performance Pulse", key: "performance-pulse", route: "/performance-pulse", icon: "insights", component: <PerformancePulse /> },
  { type: "route", name: "Stoppage Details", key: "stoppage-details", route: "/stoppage-details", icon: "report_problem", component: <StoppageDetails /> },
  { type: "route", name: "Current Flow", key: "current-flow", route: "/current-flow", icon: "autorenew", component: <CurrentFlow /> },
  { type: "route", name: "Calculator", key: "calculator", route: "/calculator", icon: "calculate", component: <Calculator /> },
  { type: "route", name: "Reports", key: "reports", route: "/reports", icon: "bar_chart", component: <Reports /> },
  { type: "route", name: "Activity Logs", key: "activity-logs", route: "/activity-logs", icon: "list_alt", component: <ActivityLogs /> },
  { type: "route", name: "InHouse Quality Stock", key: "inhouse-quality-stock", route: "/inhouse-quality-stock", icon: "home_work", component: <QualityStock /> },
  {
    type: "collapse",
    name: "Orderbook",
    key: "orderbook",
    icon: "inventory_2",
    collapse: [
      { type: "route", name: "Fabric", key: "orderbook-fabric", route: "/orderbook/fabric", icon: "style", component: <OrderbookFabric /> },
      { type: "route", name: "Yarn", key: "orderbook-yarn", route: "/orderbook/yarn", icon: "gesture", component: <OrderbookYarn /> },
    ],
  },
  {
    type: "collapse",
    name: "Settings",
    key: "settings",
    icon: "settings",
    collapse: [
      { type: "route", name: "Edit Profile", key: "edit-profile", route: "/settings/edit-profile", icon: "edit", component: <EditProfile /> },
      { type: "route", name: "Production", key: "settings-production", route: "/settings/production", icon: "precision_manufacturing", component: <SettingsProduction /> },
      { type: "route", name: "User", key: "settings-user", route: "/settings/user", icon: "person", component: <SettingsUser /> },
      { type: "route", name: "Group", key: "settings-group", route: "/settings/group", icon: "groups", component: <SettingsGroup /> },
      { type: "route", name: "Shift", key: "settings-shift", route: "/settings/shift", icon: "access_time", component: <SettingsShift /> },
    ],
  },
  { type: "title", title: "Support", key: "support-title" },
  { type: "route", name: "Feedback", key: "feedback", route: "/feedback", icon: "feedback", component: <Feedback /> },
  { type: "route", name: "Privacy Policy", key: "privacy-policy", route: "/privacy-policy", icon: "privacy_tip", component: <PrivacyPolicy /> },
  { type: "route", name: "Contact Us", key: "contact-us", route: "/contact-us", icon: "contact_support", component: <ContactUs /> },
  { type: "route", name: "Logout", key: "logout", route: "/logout", icon: "logout", component: <Logout /> },
];

export default routes;
