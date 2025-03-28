import dbConnect from '../../utils/db';
import Problem from '../../models/Problem';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await dbConnect();
    
    // Set all questions to inactive
    await Problem.updateMany({}, { active: false });
    
    // Find the first question (the Memory Manager one)
    const memoryManager = await Problem.findOne({ title: 'Memory Manager' });
    
    if (memoryManager) {
      // Set this one to active
      memoryManager.active = true;
      await memoryManager.save();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Memory Manager question activated',
        activeQuestion: memoryManager.title
      });
    } else {
      // If we didn't find it, activate any first question
      const firstQuestion = await Problem.findOne({});
      
      if (firstQuestion) {
        firstQuestion.active = true;
        await firstQuestion.save();
        
        return res.status(200).json({ 
          success: true, 
          message: 'First available question activated',
          activeQuestion: firstQuestion.title
        });
      } else {
        return res.status(404).json({ 
          success: false, 
          message: 'No questions found in database'
        });
      }
    }
  } catch (error) {
    console.error('Error activating question:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 