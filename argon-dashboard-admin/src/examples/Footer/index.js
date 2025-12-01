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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Argon Dashboard 2 MUI base styles
import typography from "assets/theme/base/typography";

function Footer({ company, links }) {
  const fallbackCompany = { href: "#", name: "technotex solutions" };
  const { href, name } = company ?? fallbackCompany;
  const safeLinks = Array.isArray(links) ? links : [];
  const { size } = typography;

  const renderLinks = () =>
    safeLinks.length === 0
      ? null
      : safeLinks.map((link) => (
          <ArgonBox key={link.name} component="li" px={2} lineHeight={1}>
            <Link href={link.href} target="_blank">
              <ArgonTypography variant="button" fontWeight="regular" color="text">
                {link.name}
              </ArgonTypography>
            </Link>
          </ArgonBox>
        ));

  return (
    <ArgonBox
      width="100%"
      display="flex"
      flexDirection={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems="center"
      px={1.5}
    >
      <ArgonBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        color="text"
        fontSize={size.sm}
        px={1.5}
      >
        <Link href={href} target="_blank">
          <ArgonTypography variant="button" fontWeight="medium" color="text">
            {name}
          </ArgonTypography>
        </Link>
      </ArgonBox>
      <ArgonBox
        component="ul"
        sx={({ breakpoints }) => ({
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          listStyle: "none",
          mt: 3,
          mb: 0,
          p: 0,

          [breakpoints.up("lg")]: {
            mt: 0,
          },
        })}
      >
        {renderLinks()}
      </ArgonBox>
  </ArgonBox>
  );
}

// Setting default values for the props of Footer
Footer.defaultProps = {
  company: { href: "#", name: "technotex solutions" },
  links: [],
};

// Typechecking props for the Footer
Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.object),
};

export default Footer;
