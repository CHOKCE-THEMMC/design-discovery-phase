-- Allow admins to insert notifications for any user (needed for approval/rejection notifications)
CREATE POLICY "Admins can insert notifications for any user"
ON public.notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
