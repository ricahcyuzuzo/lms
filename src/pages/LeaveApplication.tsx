import React, { useEffect, useState } from 'react';
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
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { format, differenceInBusinessDays } from 'date-fns';
import { leaveApi, LeaveType } from '../services/api';

interface LeaveFormValues {
  leaveTypeId: number;
  startDate: Date | null;
  returnDate: Date | null;
  reason: string;
  isHalfDay: boolean;
}

const validationSchema = yup.object().shape({
  leaveTypeId: yup.number().required('Leave type is required'),
  startDate: yup.date().required('Start date is required').nullable(),
  returnDate: yup.date().when('isHalfDay', {
    is: false,
    then: (schema) => schema.required('Return date is required')
      .nullable()
      .min(yup.ref('startDate'), 'Return date must be after or equal to start date'),
    otherwise: (schema) => schema.nullable(),
  }),
  reason: yup.string().required('Reason is required').min(10, 'Reason should be at least 10 characters'),
  isHalfDay: yup.boolean().required('Please specify if this is a half day leave'),
});

export default function LeaveApplication() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  // Get userId from localStorage
  let userId: number | null = null;
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      userId = user.id || null;
    } catch {
      userId = null;
    }
  }
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const types = await leaveApi.getLeaveTypes();
        setLeaveTypes(types);
        // Set initial leaveTypeId to the first type if available
        if (types.length > 0) {
          formik.setFieldValue('leaveTypeId', types[0].id);
        }
      } catch (error) {
        console.error('Error fetching leave types:', error);
        enqueueSnackbar('Failed to load leave types', { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveTypes();
  }, [enqueueSnackbar]);

  const formik = useFormik<LeaveFormValues>({
    initialValues: {
      leaveTypeId: 0, // Will be updated when leave types are loaded
      startDate: null,
      returnDate: null,
      reason: '',
      isHalfDay: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!userId || !values.startDate) return;

      try {
        let days, returnDate;
        if (!values.isHalfDay) {
          if (!values.returnDate) return;
          days = differenceInBusinessDays(values.returnDate, values.startDate);
          returnDate = format(values.returnDate, 'yyyy-MM-dd');
        } else {
          days = 0.5;
          returnDate = format(values.startDate, 'yyyy-MM-dd');
        }

        const request = {
          employee: userId,
          leaveTypeId: values.leaveTypeId,
          reason: values.reason,
          days,
          fromDate: format(values.startDate, 'yyyy-MM-dd'),
          isFullDay: !values.isHalfDay,
          returnDate,
        };

        await leaveApi.applyLeave(request);
        enqueueSnackbar('Leave request submitted successfully', { variant: 'success' });
        navigate('/history');
      } catch (error) {
        console.error('Error submitting leave request:', error);
        enqueueSnackbar('Failed to submit leave request', { variant: 'error' });
      }
    },
  });

  // Calculate and display the number of days
  const calculateDays = () => {
    if (!formik.values.startDate) return 0;
    if (formik.values.isHalfDay) return 0.5;
    if (!formik.values.returnDate) return 0;
    
    const businessDays = differenceInBusinessDays(formik.values.returnDate, formik.values.startDate);
    // If return date is same as start date, count as 1 day
    return businessDays === 0 ? 1 : businessDays;
  };

  const daysRequested = calculateDays();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Apply for Leave
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <FormControl fullWidth margin="normal" error={formik.touched.leaveTypeId && Boolean(formik.errors.leaveTypeId)}>
            <InputLabel>Leave Type</InputLabel>
            <Select
              name="leaveTypeId"
              value={formik.values.leaveTypeId}
              onChange={formik.handleChange}
              label="Leave Type"
            >
              {leaveTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.title}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.leaveTypeId && formik.errors.leaveTypeId && (
              <FormHelperText>{formik.errors.leaveTypeId}</FormHelperText>
            )}
          </FormControl>

          <Box mt={2} display="flex" alignItems="center" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  name="isHalfDay"
                  checked={formik.values.isHalfDay}
                  onChange={(e) => {
                    formik.setFieldValue('isHalfDay', e.target.checked);
                    if (e.target.checked) {
                      formik.setFieldValue('returnDate', null);
                    }
                  }}
                />
              }
              label="Half Day Leave"
            />
            {formik.values.startDate && (
              <Typography color="primary">
                Days Requested: {daysRequested} {daysRequested === 1 ? 'day' : 'days'}
              </Typography>
            )}
          </Box>

          <Box display="flex" gap={2} mt={2}>
            <DatePicker
              label={!formik.values.isHalfDay ? "Start Date" : "Leave Date"}
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
            {!formik.values.isHalfDay && (
              <DatePicker
                label="Return Date"
                value={formik.values.returnDate}
                onChange={(value) => formik.setFieldValue('returnDate', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.returnDate && Boolean(formik.errors.returnDate),
                    helperText: formik.touched.returnDate && formik.errors.returnDate,
                  },
                }}
              />
            )}
          </Box>

          <TextField
            fullWidth
            margin="normal"
            name="reason"
            label="Reason"
            multiline
            rows={4}
            value={formik.values.reason}
            onChange={formik.handleChange}
            error={formik.touched.reason && Boolean(formik.errors.reason)}
            helperText={formik.touched.reason && formik.errors.reason}
          />

          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={formik.isSubmitting || leaveTypes.length === 0}
            >
              Submit Request
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
