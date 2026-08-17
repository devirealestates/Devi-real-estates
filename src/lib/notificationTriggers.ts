import { broadcastPushNotification } from '@/lib/notificationService';
import { formatPriceWithSlash } from '@/lib/utils';

/**
 * Trigger real device push notification when a new property is published
 */
export async function triggerNewPropertyNotification(property: {
  id: string;
  title: string;
  price?: string;
  location?: string;
  category?: string;
}) {
  try {
    const formattedPrice = formatPriceWithSlash(property.price);
    const locationStr = property.location ? ` in ${property.location}` : '';
    const priceStr = formattedPrice ? ` for ${formattedPrice}` : '';

    return await broadcastPushNotification({
      title: '🏠 New Property Available',
      message: `${property.title}${locationStr}${priceStr}. Tap to view details and photos!`,
      type: 'property',
      url: `/property/${property.id}`,
      audience: 'all',
      targetLocation: property.location,
    });
  } catch (error) {
    console.error('Error triggering new property notification:', error);
  }
}

/**
 * Trigger notification when a property price changes
 */
export async function triggerPriceUpdateNotification(property: {
  id: string;
  title: string;
  newPrice: string;
  location?: string;
}) {
  try {
    const formattedPrice = formatPriceWithSlash(property.newPrice);
    return await broadcastPushNotification({
      title: '💰 Price Updated',
      message: `The price for "${property.title}" has been updated to ${formattedPrice}.`,
      type: 'price',
      url: `/property/${property.id}`,
      audience: 'all',
    });
  } catch (error) {
    console.error('Error triggering price update notification:', error);
  }
}

/**
 * Trigger notification when a site visit is scheduled
 */
export async function triggerSiteVisitNotification(visit: {
  propertyTitle: string;
  propertyId?: string;
  visitDate: string;
  visitTime?: string;
  userId?: string;
  userName?: string;
}) {
  try {
    const timeStr = visit.visitTime ? ` at ${visit.visitTime}` : '';
    return await broadcastPushNotification({
      title: '📅 Site Visit Confirmed',
      message: `Your site visit for "${visit.propertyTitle}" has been scheduled for ${visit.visitDate}${timeStr}.`,
      type: 'visit',
      url: visit.propertyId ? `/property/${visit.propertyId}` : '/my-bookings',
      audience: visit.userId ? 'specific_user' : 'all',
      targetUserId: visit.userId,
    });
  } catch (error) {
    console.error('Error triggering site visit notification:', error);
  }
}

/**
 * Trigger notification when a new customer enquiry is submitted
 */
export async function triggerEnquiryNotification(enquiry: {
  propertyTitle?: string;
  userName?: string;
  phone?: string;
  propertyId?: string;
}) {
  try {
    return await broadcastPushNotification({
      title: '🔥 New Property Enquiry',
      message: `${enquiry.userName || 'A client'} enquired about "${enquiry.propertyTitle || 'a property'}".`,
      type: 'enquiry',
      url: enquiry.propertyId ? `/property/${enquiry.propertyId}` : '/admin/dashboard',
      audience: 'all',
    });
  } catch (error) {
    console.error('Error triggering enquiry notification:', error);
  }
}
