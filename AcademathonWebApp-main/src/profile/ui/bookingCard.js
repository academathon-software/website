import React, { useState } from 'react';
import "./bookingCard.css";
import Button from '../../ui/button';

function BookingCard({ booking, handleConfirm, handleDeny }) {
  const [meetingLink, setMeetingLink] = useState('');
  const [showMeetingLinkField, setShowMeetingLinkField] = useState(false);

  const handleConfirmClick = () => {
    console.log("Booking confirmed:",booking.confirmed);
    if (!booking.confirmed) {
      setShowMeetingLinkField(true);
      booking.confirmed=true;
    } else {
        console.log("Meeting link");
      handleConfirm(booking.id, meetingLink);
      setShowMeetingLinkField(false);
      // Assuming you want to clear the meeting link field after submission
      setMeetingLink('');
    }
  };
  const date = new Date(booking.date);
  const formattedDate = date.toLocaleDateString('en-US');
  return (
    <div className="booking-card" key={booking.id}>
      <h3> Booking on: {formattedDate}</h3>
      <h3> At {booking.time} for {booking.duration} min</h3>
      <h3> Grade: {booking.grade}</h3>

      <div className="button-container">
        {!booking.confirmed && !showMeetingLinkField && <Button onClick={() => handleConfirmClick(booking.id)} text="Confirm"></Button>}
        {showMeetingLinkField && (
          <>
            <input
              type="text"
              placeholder="Enter meeting link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
            <Button onClick={() => handleConfirmClick()} text="Submit"></Button>
          </>
        )}
        <Button text="Deny" onClick={() => handleDeny(booking.booking_doc_id)}></Button>
      </div>
    </div>
  );
}

export default BookingCard;