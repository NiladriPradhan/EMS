import { Typography, Box } from "@mui/material";

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600 }} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        This page is under construction.
      </Typography>
    </Box>
  );
};

export default PlaceholderPage;
