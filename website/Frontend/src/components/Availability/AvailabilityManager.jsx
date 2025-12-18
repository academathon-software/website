import React, { useState, useEffect } from 'react';
import './AvailabilityManager.css';
import TutorSidebar from '../Shared/TutorSidebar';
import { availabilityAPI, tutorAPI } from '../../services/api';
import { useUser } from '../../context/UserContext';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const AvailabilityManager = () => {
  const { setUserType } = useUser();
  const [tutorProfileId, setTutorProfileId] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Exception form state
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [exceptionForm, setExceptionForm] = useState({
    exceptionDate: '',
    startTime: '',
    endTime: '',
    type: 'BLOCKED',
    reason: ''
  });

  useEffect(() => {
    setUserType('tutor');
    fetchTutorProfileAndAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTutorProfileAndAvailability = async () => {
    try {
      setLoading(true);
      // First get the tutor profile to get the ID
      const tutorProfileRes = await tutorAPI.getMyProfile();
      const tutorId = tutorProfileRes.data.id;
      setTutorProfileId(tutorId);
      
      // Now fetch availability using the tutor profile ID
      const [scheduleRes, exceptionsRes] = await Promise.all([
        availabilityAPI.getSchedule(tutorId).catch(() => ({ data: [] })),
        availabilityAPI.getMyExceptions().catch(() => ({ data: [] }))
      ]);
      
      // Convert schedule array to object keyed by day
      const scheduleByDay = {};
      DAYS_OF_WEEK.forEach(day => {
        scheduleByDay[day.value] = [];
      });
      
      if (scheduleRes.data) {
        scheduleRes.data.forEach(entry => {
          if (!scheduleByDay[entry.dayOfWeek]) {
            scheduleByDay[entry.dayOfWeek] = [];
          }
          scheduleByDay[entry.dayOfWeek].push({
            id: entry.id,
            startTime: entry.startTime,
            endTime: entry.endTime,
            isActive: entry.isActive
          });
        });
      }
      
      setSchedule(scheduleByDay);
      setExceptions(exceptionsRes.data || []);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!tutorProfileId) return;
    
    try {
      const [scheduleRes, exceptionsRes] = await Promise.all([
        availabilityAPI.getSchedule(tutorProfileId).catch(() => ({ data: [] })),
        availabilityAPI.getMyExceptions().catch(() => ({ data: [] }))
      ]);
      
      // Convert schedule array to object keyed by day
      const scheduleByDay = {};
      DAYS_OF_WEEK.forEach(day => {
        scheduleByDay[day.value] = [];
      });
      
      if (scheduleRes.data) {
        scheduleRes.data.forEach(entry => {
          if (!scheduleByDay[entry.dayOfWeek]) {
            scheduleByDay[entry.dayOfWeek] = [];
          }
          scheduleByDay[entry.dayOfWeek].push({
            id: entry.id,
            startTime: entry.startTime,
            endTime: entry.endTime,
            isActive: entry.isActive
          });
        });
      }
      
      setSchedule(scheduleByDay);
      setExceptions(exceptionsRes.data || []);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability');
    }
  };

  const addTimeSlot = (dayOfWeek) => {
    setSchedule(prev => ({
      ...prev,
      [dayOfWeek]: [
        ...prev[dayOfWeek],
        { startTime: '09:00', endTime: '17:00', isActive: true }
      ]
    }));
  };

  const removeTimeSlot = (dayOfWeek, index) => {
    setSchedule(prev => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (dayOfWeek, index, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const saveSchedule = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Convert schedule object to array format
      const schedules = [];
      Object.keys(schedule).forEach(dayOfWeek => {
        schedule[dayOfWeek].forEach(slot => {
          schedules.push({
            dayOfWeek: parseInt(dayOfWeek),
            startTime: slot.startTime,
            endTime: slot.endTime,
            isActive: slot.isActive !== false
          });
        });
      });
      
      await availabilityAPI.setRecurringSchedule(schedules);
      
      setSuccess('Availability schedule saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError(err.response?.data?.error || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleAddException = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      
      await availabilityAPI.addException(exceptionForm);
      
      setSuccess('Exception added successfully!');
      setShowExceptionForm(false);
      setExceptionForm({
        exceptionDate: '',
        startTime: '',
        endTime: '',
        type: 'BLOCKED',
        reason: ''
      });
      
      // Refresh exceptions
      fetchAvailability();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding exception:', err);
      setError(err.response?.data?.error || 'Failed to add exception');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveException = async (exceptionId) => {
    if (!window.confirm('Are you sure you want to remove this exception?')) {
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      await availabilityAPI.removeException(exceptionId);
      
      setSuccess('Exception removed successfully!');
      fetchAvailability();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing exception:', err);
      setError(err.response?.data?.error || 'Failed to remove exception');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="availability-manager">
        <TutorSidebar />
        <div className="availability-content">
          <div className="loading">Loading availability...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="availability-manager">
      <TutorSidebar />
      
      <div className="availability-content">
        <div className="availability-header">
          <h1>Manage Availability</h1>
          <p>Set your recurring weekly schedule and manage exceptions</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Recurring Weekly Schedule */}
        <div className="schedule-section">
          <h2>Weekly Schedule</h2>
          <p className="section-description">
            Set your regular availability for each day of the week
          </p>
          
          <div className="schedule-grid">
            {DAYS_OF_WEEK.map(day => (
              <div key={day.value} className="day-schedule">
                <div className="day-header">
                  <h3>{day.label}</h3>
                  <button
                    className="add-slot-btn"
                    onClick={() => addTimeSlot(day.value)}
                  >
                    + Add Time
                  </button>
                </div>
                
                <div className="time-slots">
                  {schedule[day.value]?.length > 0 ? (
                    schedule[day.value].map((slot, index) => (
                      <div key={index} className="time-slot">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(day.value, index, 'startTime', e.target.value)}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(day.value, index, 'endTime', e.target.value)}
                        />
                        <button
                          className="remove-slot-btn"
                          onClick={() => removeTimeSlot(day.value, index)}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-slots">Not available</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="save-actions">
            <button
              className="save-btn"
              onClick={saveSchedule}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </div>

        {/* Exceptions Section */}
        <div className="exceptions-section">
          <div className="exceptions-header">
            <h2>Exceptions</h2>
            <button
              className="add-exception-btn"
              onClick={() => setShowExceptionForm(!showExceptionForm)}
            >
              {showExceptionForm ? 'Cancel' : '+ Add Exception'}
            </button>
          </div>
          
          <p className="section-description">
            Add one-time availability or block specific dates
          </p>

          {showExceptionForm && (
            <form className="exception-form" onSubmit={handleAddException}>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={exceptionForm.exceptionDate}
                    onChange={(e) => setExceptionForm({...exceptionForm, exceptionDate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={exceptionForm.type}
                    onChange={(e) => setExceptionForm({...exceptionForm, type: e.target.value})}
                    required
                  >
                    <option value="BLOCKED">Block Time</option>
                    <option value="AVAILABLE">Add Availability</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={exceptionForm.startTime}
                    onChange={(e) => setExceptionForm({...exceptionForm, startTime: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={exceptionForm.endTime}
                    onChange={(e) => setExceptionForm({...exceptionForm, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Reason (optional)</label>
                <input
                  type="text"
                  value={exceptionForm.reason}
                  onChange={(e) => setExceptionForm({...exceptionForm, reason: e.target.value})}
                  placeholder="e.g., Vacation, Conference, etc."
                />
              </div>
              
              <button type="submit" className="submit-exception-btn" disabled={saving}>
                {saving ? 'Adding...' : 'Add Exception'}
              </button>
            </form>
          )}

          <div className="exceptions-list">
            {exceptions.length > 0 ? (
              exceptions.map(exception => (
                <div key={exception.id} className={`exception-item ${exception.type.toLowerCase()}`}>
                  <div className="exception-info">
                    <div className="exception-date">
                      {new Date(exception.exceptionDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="exception-time">
                      {exception.startTime} - {exception.endTime}
                    </div>
                    <div className="exception-type-badge">
                      {exception.type === 'BLOCKED' ? 'Blocked' : 'Available'}
                    </div>
                    {exception.reason && (
                      <div className="exception-reason">{exception.reason}</div>
                    )}
                  </div>
                  <button
                    className="remove-exception-btn"
                    onClick={() => handleRemoveException(exception.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="no-exceptions">No exceptions set</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;

