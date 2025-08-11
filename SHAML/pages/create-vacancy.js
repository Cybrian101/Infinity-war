import JobVacancyForm from '../components/JobVacancyForm';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const CreateVacancy = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="create-vacancy" />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <JobVacancyForm />
        </main>
      </div>
    </div>
  );
};

export default CreateVacancy; 