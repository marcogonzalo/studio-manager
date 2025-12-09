-- Add archived field to project_notes table
ALTER TABLE project_notes ADD COLUMN archived boolean DEFAULT false;

-- Add delete policy for project_notes
CREATE POLICY "Users can delete their project notes" ON project_notes FOR DELETE USING (auth.uid() = user_id);

-- Add update policy for project_notes (to allow archiving)
CREATE POLICY "Users can update their project notes" ON project_notes FOR UPDATE USING (auth.uid() = user_id);

