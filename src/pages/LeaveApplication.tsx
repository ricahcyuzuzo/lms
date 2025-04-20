import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useLeaveStore } from '../store/leaveStore';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

interface LeaveFormValues {
  leaveType: string;
  startDate: Date | null;
  endDate: Date | null;
  reason: string;
}

const validationSchema = yup.object({
  leaveType: yup.string().required('Leave type is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), "End date can't be before start date")
    .required('End date is required'),
  reason: yup.string().required('Reason is required'),
});

export default function LeaveApplication() {
  const addLeaveRequest = useLeaveStore((state) => state.addLeaveRequest);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik<LeaveFormValues>({
    initialValues: {
      leaveType: '',
      startDate: null,
      endDate: null,
      reason: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (values.startDate && values.endDate) {
        try {
          addLeaveRequest({
            employeeId: 'emp1', // Hardcoded for now, would come from auth
            type: values.leaveType,
            startDate: values.startDate,
            endDate: values.endDate,
            reason: values.reason,
          });
          enqueueSnackbar('Leave request submitted successfully', { variant: 'success' });
          navigate('/history');
        } catch (error) {
          enqueueSnackbar('Failed to submit leave request', { variant: 'error' });
        }
      }
    },
  });

  return (
    <Box className="p-6 flex flex-col items-center">
      <Typography variant="h4" gutterBottom className="text-center">
        Apply for Leave
      </Typography>
      <Paper className="p-6 w-full max-w-2xl">
        <form onSubmit={formik.handleSubmit}>
          <Box className="flex flex-col gap-6">
            <FormControl fullWidth error={formik.touched.leaveType && Boolean(formik.errors.leaveType)}>
              <InputLabel>Leave Type</InputLabel>
              <Select
                name="leaveType"
                value={formik.values.leaveType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Leave Type"
              >
                <MenuItem value="vacation">Vacation</MenuItem>
                <MenuItem value="sick">Sick Leave</MenuItem>
                <MenuItem value="personal">Personal Leave</MenuItem>
              </Select>
              {formik.touched.leaveType && formik.errors.leaveType && (
                <FormHelperText>{formik.errors.leaveType}</FormHelperText>
              )}
            </FormControl>

            <DatePicker
              label="Start Date"
              value={formik.values.startDate}
              onChange={(value) => formik.setFieldValue('startDate', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: formik.touched.startDate && Boolean(formik.errors.startDate),
                  helperText: formik.touched.startDate && formik.errors.startDate,
                },
              }}
            />

            <DatePicker
              label="End Date"
              value={formik.values.endDate}
              onChange={(value) => formik.setFieldValue('endDate', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: formik.touched.endDate && Boolean(formik.errors.endDate),
                  helperText: formik.touched.endDate && formik.errors.endDate,
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              name="reason"
              label="Reason"
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.reason && Boolean(formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
            />

            <Box className="flex gap-4 justify-end">
              <Button
                variant="outlined"
                onClick={() => formik.resetForm()}
                className="px-6"
              >
                Reset
              </Button>
              <Button
                variant="contained"
                type="submit"
                className="px-6"
              >
                Submit Application
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
